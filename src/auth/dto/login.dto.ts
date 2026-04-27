import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Alamat email tidak valid' })
  @IsNotEmpty({ message: 'Email tidak boleh kosong' })
  email: string;

  @IsString({ message: 'Password harus berupa string' })
  @IsNotEmpty({ message: 'Password tidak boleh kosong' })
  @MinLength(8, { message: 'Password minimal 8 karakter' })
  password: string;
}
