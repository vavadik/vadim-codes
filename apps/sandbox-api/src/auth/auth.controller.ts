import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CookieOptions, Request, Response } from 'express';
import { AuthService } from './auth.service';
import { GithubAuthGuard } from './guards/github-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { OAuthUser } from './interfaces/oauth-user.interface';

const CLEAR_COOKIE: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  path: '/',
  maxAge: 0,
};

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService
  ) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleInitiate(): void {
    // Passport redirects to Google — this body is never reached
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.issueTokenAndRedirect(req.user as unknown as OAuthUser, res);
  }

  @Get('github')
  @UseGuards(GithubAuthGuard)
  githubInitiate(): void {
    // Passport redirects to GitHub — this body is never reached
  }

  @Get('github/callback')
  @UseGuards(GithubAuthGuard)
  async githubCallback(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.issueTokenAndRedirect(req.user as unknown as OAuthUser, res);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: Request): {
    id: string;
    email: string | null;
    name: string | null;
    avatarUrl: string | null;
  } {
    const user = req.user!;
    return { id: user.sub, email: user.email, name: user.name, avatarUrl: user.avatarUrl };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  logout(@Res({ passthrough: true }) res: Response): { message: string } {
    res.cookie('access_token', '', CLEAR_COOKIE);
    return { message: 'logged out' };
  }

  private async issueTokenAndRedirect(oauthUser: OAuthUser, res: Response): Promise<void> {
    if (!oauthUser) {
      throw new UnauthorizedException('OAuth authentication failed');
    }

    const jwt = await this.authService.handleOAuthCallback(oauthUser);
    const secure = this.config.get<string>('NODE_ENV') === 'production';

    res.cookie('access_token', jwt, this.authService.cookieOptions(secure));
    res.redirect(this.config.get<string>('AUTH_SUCCESS_REDIRECT') ?? 'http://localhost:5173');
  }
}
