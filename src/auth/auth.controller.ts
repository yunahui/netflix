import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Headers,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './strategy/local.strategy';
import { JwtAuthGuard } from './strategy/jwt.strategy';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  registerUser(@Headers('authorization') token: string) {
    return this.authService.register(token);
  }

  @Post('login')
  loginUser(@Headers('authorization') token: string) {
    return this.authService.login(token);
  }

  @Post('token/access')
  async rotateAccessToken(@Request() req) {
    if (req.user.type === 'access') {
      throw new UnauthorizedException('잘못된 토큰값입니다.');
    }
    return {
      accessToken: await this.authService.issueToken(req.user, false),
    };
  }

  // 아래는 실제로 쓰지 않을 예정
  @UseGuards(LocalAuthGuard)
  @Post('login/passport')
  async loginUserPassport(@Request() req) {
    return {
      refreshToken: await this.authService.issueToken(req.user, true),
      accessToken: await this.authService.issueToken(req.user, false),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('private')
  async private(@Request() req) {
    return req.user;
  }
}
