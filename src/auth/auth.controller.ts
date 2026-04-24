import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(ThrottlerGuard)
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    // Placeholder for Captcha verification
    // In a real scenario, we would verify the captchaToken with a provider here.
    const isCaptchaValid = true; 
    if (!isCaptchaValid) {
       // throw new BadRequestException('Captcha tidak valid');
    }

    return await this.authService.register(registerDto);
  }
}
