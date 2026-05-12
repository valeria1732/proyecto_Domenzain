import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService, AuditAction } from '../audit/audit.service';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { LoginDto } from './dto/login.dto';
import { appConfig } from '../config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly auditService: AuditService,
  ) {}

  async login(
    dto: LoginDto,
    request: Request,
  ): Promise<{ access_token: string; user: { id: number; username: string; role: string; name: string; lastName: string } }> {
    const ipAddress = this.extractIp(request);
    const userAgent = request.headers['user-agent'] || 'unknown';

    const user = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });

    if (!user) {
      // Timing attack prevention: verify a dummy hash
      await argon2.verify(
        '$argon2id$v=19$m=65536,t=3,p=4$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        dto.password,
      ).catch(() => {});

      await this.auditService.log({
        action: AuditAction.LOGIN_FAILED,
        entity: 'Auth',
        username: dto.username,
        ipAddress,
        userAgent,
        details: JSON.stringify({ reason: 'Usuario no encontrado' }),
      });

      throw new UnauthorizedException('Credenciales inválidas');
    }

    let isValidPassword = false;
    try {
      isValidPassword = await argon2.verify(user.password, dto.password);
    } catch {
      isValidPassword = false;
    }

    if (!isValidPassword) {
      await this.auditService.log({
        action: AuditAction.LOGIN_FAILED,
        entity: 'Auth',
        entityId: user.id,
        userId: user.id,
        username: user.username,
        ipAddress,
        userAgent,
        details: JSON.stringify({ reason: 'Contraseña incorrecta' }),
      });

      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      role: user.role as any,
    };

    const access_token = await this.jwtService.signAsync(payload, {
      secret: appConfig.jwt.secret,
      expiresIn: appConfig.jwt.expiresIn,
    });

    await this.auditService.log({
      action: AuditAction.LOGIN_SUCCESS,
      entity: 'Auth',
      entityId: user.id,
      userId: user.id,
      username: user.username,
      ipAddress,
      userAgent,
    });

    return {
      access_token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
        lastName: user.lastName,
      },
    };
  }

  async logout(userId: number, username: string, request: Request): Promise<void> {
    await this.auditService.log({
      action: AuditAction.LOGOUT,
      entity: 'Auth',
      entityId: userId,
      userId,
      username,
      ipAddress: this.extractIp(request),
      userAgent: request.headers['user-agent'] || 'unknown',
    });
  }

  private extractIp(request: Request): string {
    const forwarded = request.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    return request.ip || 'unknown';
  }
}
