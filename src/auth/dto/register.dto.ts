import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsNotEmpty({ message: 'Email tidak boleh kosong' })
  email: string;

  @ApiProperty({ example: 'John Doe', description: 'Full name of the user', maxLength: 100 })
  @IsString()
  @IsNotEmpty({ message: 'Nama tidak boleh kosong' })
  @MaxLength(100, { message: 'Nama maksimal 100 karakter' })
  name: string;

  @ApiProperty({ example: 'password123', description: 'Secure password (min 8 characters)', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'Password minimal 8 karakter' })
  @IsNotEmpty({ message: 'Password tidak boleh kosong' })
  password: string;

  @ApiProperty({ example: 'dummy-captcha-token', description: 'Captcha verification token' })
  @IsString()
  @IsNotEmpty({ message: 'Captcha token wajib diisi untuk verifikasi keamanan' })
  captchaToken: string;
}
