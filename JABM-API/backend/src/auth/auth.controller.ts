import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/register
   * Registra un nuevo usuario con contraseña hasheada.
   */
  @Post('register')
  @ApiOperation({
    summary: 'Registrar nuevo usuario',
    description:
      'Crea una cuenta de usuario con rol USER por defecto. ' +
      'La contraseña se hashea con Argon2 antes de almacenarse.',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado exitosamente. Retorna el token JWT.',
    schema: {
      example: {
        message: 'Usuario registrado exitosamente',
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6...',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos (validación fallida)' })
  @ApiResponse({ status: 409, description: 'El email ya está registrado' })
  async register(@Body() registerDto: RegisterDto, @Req() req: Request) {
    const ipAddress = req.ip || req.socket.remoteAddress || null;
    return this.authService.register(registerDto, ipAddress);
  }

  /**
   * POST /auth/login
   * Valida credenciales y devuelve un JWT.
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Iniciar sesión',
    description:
      'Valida las credenciales del usuario y retorna un token JWT. ' +
      'El token debe usarse en el header Authorization como Bearer token.',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso. Retorna el token JWT.',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6...',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
    const ipAddress = req.ip || req.socket.remoteAddress || null;
    return this.authService.login(loginDto, ipAddress);
  }
}
