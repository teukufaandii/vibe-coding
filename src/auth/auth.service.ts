import { Injectable, ConflictException, Inject, UnauthorizedException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { JwtService } from '@nestjs/jwt';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Alamat email sudah terdaftar');
    }

    const hashedPassword = await argon2.hash(dto.password);

    const user = await this.prisma.$transaction(async (prisma) => {
      const newUser = await prisma.user.create({
        data: {
          email: dto.email,
          name: dto.name,
          identity: {
            create: {
              passwordHash: hashedPassword,
            },
          },
        },
      });

      await prisma.auditLog.create({
        data: {
          action: 'REGISTER',
          entity: 'User',
          entityId: newUser.id,
          userId: newUser.id,
          newData: {
            email: newUser.email,
            name: newUser.name,
          },
        },
      });

      return newUser;
    });

    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload);

    // Store token in Redis with 24h TTL (consistent with login)
    const sessionKey = `auth:token:${user.id}`;
    await this.cacheManager.set(sessionKey, accessToken, 24 * 60 * 60 * 1000);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      accessToken,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { identity: true },
    });

    if (!user || !user.identity) {
      throw new UnauthorizedException('Email atau password salah');
    }

    const isPasswordValid = await argon2.verify(
      user.identity.passwordHash,
      dto.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email atau password salah');
    }

    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload);

    // Store token in Redis with 24h TTL
    const sessionKey = `auth:token:${user.id}`;
    await this.cacheManager.set(sessionKey, accessToken, 24 * 60 * 60 * 1000);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      accessToken,
    };
  }
}
