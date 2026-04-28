import { ApiProperty } from '@nestjs/swagger';

class UserResponse {
  @ApiProperty({ example: 'uuid-123', description: 'User unique ID' })
  id: string;

  @ApiProperty({ example: 'user@example.com', description: 'User email' })
  email: string;

  @ApiProperty({ example: 'John Doe', description: 'User name' })
  name: string;
}

export class AuthResponseDto {
  @ApiProperty({ type: UserResponse })
  user: UserResponse;

  @ApiProperty({ example: 'jwt-token-string', description: 'JWT access token' })
  accessToken: string;
}
