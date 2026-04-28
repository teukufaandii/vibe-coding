import { Controller, Get, Post, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('current')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getCurrentUser(@CurrentUser() user: any) {
    // The payload sub usually contains the user ID
    const userId = user.sub;
    return this.usersService.getCurrentUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user and invalidate token' })
  @ApiResponse({ status: 200, description: 'Logout successful.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async logout(@CurrentUser() user: any) {
    const userId = user.sub;
    return this.usersService.logout(userId);
  }
}
