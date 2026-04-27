import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsNotEmpty({ message: 'Email tidak boleh kosong' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Nama tidak boleh kosong' })
  @MaxLength(100, { message: 'Nama maksimal 100 karakter' })
  name: string;

  @IsString()
  @MinLength(8, { message: 'Password minimal 8 karakter' })
  @IsNotEmpty({ message: 'Password tidak boleh kosong' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Captcha token wajib diisi untuk verifikasi keamanan' })
  captchaToken: string;
}
