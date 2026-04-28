import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('Authentication')
@Controller('users')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(ThrottlerGuard)
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered.' })
  @ApiResponse({ status: 400, description: 'Bad Request / Validation Error.' })
  @ApiResponse({ status: 409, description: 'Conflict / Email already exists.' })
  async register(@Body() registerDto: RegisterDto) {
    // Placeholder for Captcha verification
    // In a real scenario, we would verify the captchaToken with a provider here.
    const isCaptchaValid = true; 
    if (!isCaptchaValid) {
       // throw new BadRequestException('Captcha tidak valid');
    }

    return await this.authService.register(registerDto);
  }

  @UseGuards(ThrottlerGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login and get access token' })
  @ApiResponse({ status: 200, description: 'Successfully authenticated.' })
  @ApiResponse({ status: 401, description: 'Unauthorized / Invalid credentials.' })
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }
}
