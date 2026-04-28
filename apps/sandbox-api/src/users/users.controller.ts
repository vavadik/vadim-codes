import { Controller, Delete, HttpCode, HttpStatus, Req, Res, UseGuards } from '@nestjs/common';
import type { CookieOptions, Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';

const CLEAR_COOKIE: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  path: '/',
  maxAge: 0,
};

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async deleteMe(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
    await this.usersService.deleteUser(req.user!.sub);
    res.cookie('access_token', '', CLEAR_COOKIE);
  }
}
