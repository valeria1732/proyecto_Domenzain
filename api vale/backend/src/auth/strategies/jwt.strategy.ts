import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

/**
 * JWT Strategy para Passport.
 *
 * Extrae el token del header Authorization: Bearer <token>
 * y valida su firma contra JWT_SECRET.
 *
 * El payload decodificado (userId, email, role) se adjunta
 * automáticamente a request.user por Passport.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  /**
   * Passport llama a este método después de verificar la firma del JWT.
   * El objeto retornado se asigna a request.user.
   */
  async validate(payload: { sub: string; email: string; role: string }) {
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
