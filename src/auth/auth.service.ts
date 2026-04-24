import { Injectable, ConflictException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
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

    const accessToken = uuidv4();
    const sessionKey = `session:${accessToken}`;

    await this.cacheManager.set(
      sessionKey,
      {
        userId: user.id,
        email: user.email,
      },
      86400 * 1000,
    );

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
