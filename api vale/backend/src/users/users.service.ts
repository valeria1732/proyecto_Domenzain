import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto, UpdateRoleDto, CreateUserDto } from './dto';
import * as argon2 from 'argon2';
import { AuditService } from '../audit/audit.service';
import { AuditSeverity, Role } from '../common/enums';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Obtener todos los usuarios.
   * La exclusión de password se maneja por @Exclude() en la entidad + ClassSerializerInterceptor.
   */
  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      order: { name: 'ASC' },
    });
  }

  /**
   * Crear un nuevo usuario (ADMIN)
   */
  async create(createUserDto: CreateUserDto, adminUserId: string, ipAddress: string | null): Promise<User> {
    const { email, password, name, role } = createUserDto;

    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('El email ya está en uso');
    }

    const hashedPassword = await argon2.hash(password);
    const user = this.userRepository.create({
      name,
      email,
      password: hashedPassword,
      role: role || Role.USER,
    });

    const savedUser = await this.userRepository.save(user);

    await this.auditService.log({
      userId: adminUserId,
      action: 'USER_REGISTERED',
      severity: AuditSeverity.INFO,
      details: `Usuario creado manualmente: ${email} con rol ${savedUser.role} por admin ${adminUserId}`,
      ipAddress,
    });

    this.logger.log(`Usuario creado por admin: ${email}`);
    return savedUser;
  }

  /**
   * Obtener un usuario por ID.
   */
  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return user;
  }

  /**
   * Actualizar perfil de usuario.
   *
   * Seguridad IDOR:
   * - Solo el propio usuario puede editar su perfil, a menos que sea ADMIN.
   * - Un usuario normal que intente editar el perfil de otro recibe 403 Forbidden.
   */
  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    requestingUserId: string,
    requestingUserRole: Role,
  ): Promise<User> {
    // Protección IDOR: verificar que el usuario edite solo su propio perfil (o sea ADMIN)
    if (requestingUserId !== id && requestingUserRole !== Role.ADMIN) {
      throw new ForbiddenException(
        'No tienes permisos para editar este perfil',
      );
    }

    const user = await this.findOne(id);

    // Si se está cambiando el email, verificar unicidad
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('El email ya está en uso por otro usuario');
      }
    }

    Object.assign(user, updateUserDto);
    const updatedUser = await this.userRepository.save(user);

    this.logger.log(`Perfil actualizado: ${updatedUser.email}`);

    return updatedUser;
  }

  /**
   * Cambiar el rol de un usuario.
   * Solo accesible por ADMIN (protegido por RolesGuard en el controlador).
   */
  async updateRole(
    id: string,
    updateRoleDto: UpdateRoleDto,
    adminUserId: string,
    ipAddress: string | null,
  ): Promise<User> {
    const user = await this.findOne(id);
    const previousRole = user.role;

    user.role = updateRoleDto.role;
    const updatedUser = await this.userRepository.save(user);

    // Registrar cambio de rol en auditoría (evento de seguridad relevante)
    await this.auditService.log({
      userId: adminUserId,
      action: 'ROLE_CHANGED',
      severity: AuditSeverity.WARNING,
      details: `Rol de usuario ${user.email} cambiado de ${previousRole} a ${updateRoleDto.role} por admin ${adminUserId}`,
      ipAddress,
    });

    this.logger.warn(
      `Rol cambiado: ${user.email} de ${previousRole} a ${updateRoleDto.role}`,
    );

    return updatedUser;
  }

  /**
   * Eliminar un usuario.
   * Solo accesible por ADMIN (protegido por RolesGuard en el controlador).
   */
  async remove(
    id: string,
    adminUserId: string,
    ipAddress: string | null,
  ): Promise<{ message: string }> {
    const user = await this.findOne(id);

    await this.userRepository.remove(user);

    // Registrar eliminación en auditoría
    await this.auditService.log({
      userId: adminUserId,
      action: 'USER_DELETED',
      severity: AuditSeverity.CRITICAL,
      details: `Usuario eliminado: ${user.email} (ID: ${id}) por admin ${adminUserId}`,
      ipAddress,
    });

    this.logger.warn(`Usuario eliminado: ${user.email} por admin ${adminUserId}`);

    return { message: `Usuario ${user.email} eliminado exitosamente` };
  }
}
