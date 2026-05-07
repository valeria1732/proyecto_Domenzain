import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { User } from '../users/entities/user.entity';
import { AuditService } from '../audit/audit.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuditSeverity } from '../common/enums';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Registro de un nuevo usuario.
   *
   * Seguridad:
   * - La contraseña se hashea con Argon2 antes de persistir (resistente a GPU/ASIC).
   * - Se verifica unicidad de email para prevenir cuentas duplicadas.
   * - El evento se registra en AuditLog.
   */
  async register(
    registerDto: RegisterDto,
    ipAddress: string | null,
  ): Promise<{ message: string; user: Partial<User> }> {
    const { name, email, password } = registerDto;

    // Verificar si el email ya existe
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      // Registrar intento de registro con email duplicado
      await this.auditService.log({
        action: 'REGISTER_FAILED_DUPLICATE_EMAIL',
        severity: AuditSeverity.WARNING,
        details: `Intento de registro con email duplicado: ${email}`,
        ipAddress,
      });

      throw new ConflictException('El email ya está registrado');
    }

    // Hashear la contraseña con Argon2 (más seguro que bcrypt contra ataques GPU)
    const hashedPassword = await argon2.hash(password);

    const user = this.userRepository.create({
      name,
      email,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);

    // Registrar evento de creación exitosa
    await this.auditService.log({
      userId: savedUser.id,
      action: 'USER_CREATED',
      severity: AuditSeverity.INFO,
      details: `Usuario registrado: ${email}`,
      ipAddress,
    });

    this.logger.log(`Usuario creado exitosamente: ${email}`);

    return {
      message: 'Usuario registrado exitosamente',
      user: {
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
        createdAt: savedUser.createdAt,
      },
    };
  }

  /**
   * Login de usuario.
   *
   * Seguridad:
   * - El mensaje de error es genérico ("credenciales inválidas") para no
   *   revelar si el email existe o no (prevención de enumeración de usuarios).
   * - Se registran tanto logins exitosos como fallidos en AuditLog.
   * - El JWT contiene solo datos mínimos: userId, email, role.
   */
  async login(
    loginDto: LoginDto,
    ipAddress: string | null,
  ): Promise<{ access_token: string; user: Partial<User> }> {
    const { email, password } = loginDto;

    // TypeORM usa prepared statements internamente, protegiéndonos de SQL injection
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      // Registrar intento de login con email inexistente
      await this.auditService.log({
        action: 'LOGIN_FAILED',
        severity: AuditSeverity.WARNING,
        details: `Intento de login con email inexistente: ${email}`,
        ipAddress,
      });

      // Mensaje genérico para no revelar existencia del email
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar contraseña con Argon2
    const isPasswordValid = await argon2.verify(user.password, password);

    if (!isPasswordValid) {
      // Registrar intento de login con contraseña incorrecta
      await this.auditService.log({
        userId: user.id,
        action: 'LOGIN_FAILED',
        severity: AuditSeverity.WARNING,
        details: `Contraseña incorrecta para usuario: ${email}`,
        ipAddress,
      });

      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generar JWT con payload mínimo
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const access_token = await this.jwtService.signAsync(payload);

    // Registrar login exitoso
    await this.auditService.log({
      userId: user.id,
      action: 'LOGIN_SUCCESS',
      severity: AuditSeverity.INFO,
      details: `Login exitoso: ${email}`,
      ipAddress,
    });

    this.logger.log(`Login exitoso: ${email}`);

    return {
      access_token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
