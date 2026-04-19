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
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { SalesforceAuthGuard } from './guards/salesforce-auth.guard';
import type { SfUser } from './interfaces/sf-user.interface';

const COOKIE_OPTIONS_BASE: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  path: '/',
};

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService
  ) {}

  @Get('salesforce')
  @UseGuards(SalesforceAuthGuard)
  initiate(): void {
    // Passport redirects the browser to Salesforce — this handler is never reached
  }

  @Get('salesforce/callback')
  @UseGuards(SalesforceAuthGuard)
  async callback(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
    const sfUser = req.user as unknown as SfUser;
    const { jwt, rawToken } = await this.authService.handleSfCallback(sfUser);

    const secure = this.config.get<string>('NODE_ENV') === 'production';
    const cookieOptions: CookieOptions = { ...COOKIE_OPTIONS_BASE, secure };

    res.cookie('access_token', jwt, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
    res.cookie('refresh_token', rawToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.redirect(this.config.getOrThrow<string>('SF_AUTH_SUCCESS_REDIRECT'));
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ): Promise<{ message: string }> {
    const rawToken: string | undefined = req.cookies?.['refresh_token'];
    if (!rawToken) {
      throw new UnauthorizedException('No refresh token');
    }

    const { jwt, rawToken: newRawToken } = await this.authService.refreshTokens(rawToken);

    const secure = this.config.get<string>('NODE_ENV') === 'production';
    const cookieOptions: CookieOptions = { ...COOKIE_OPTIONS_BASE, secure };

    res.cookie('access_token', jwt, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
    res.cookie('refresh_token', newRawToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { message: 'ok' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: Request): { sfUserId: string; sfOrgId: string; email: string } {
    const user = req.user!;
    return { sfUserId: user.sub, sfOrgId: user.org, email: user.email };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ): Promise<{ message: string }> {
    await this.authService.logout(req.user!.sub);

    const cookieOptions: CookieOptions = { ...COOKIE_OPTIONS_BASE, maxAge: 0 };
    res.cookie('access_token', '', cookieOptions);
    res.cookie('refresh_token', '', cookieOptions);

    return { message: 'logged out' };
  }
}
