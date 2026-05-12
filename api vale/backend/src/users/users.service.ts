import { Injectable, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService, AuditAction } from '../audit/audit.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';

const SAFE_USER_SELECT = {
  id: true,
  name: true,
  lastName: true,
  username: true,
  role: true,
  createdAt: true,
  updatedAt: true,
  password: false,
} as const;

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: SAFE_USER_SELECT,
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: SAFE_USER_SELECT,
    });
    if (!user) throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    return user;
  }

  async create(dto: CreateUserDto, adminUser: JwtPayload, ipAddress?: string) {
    const existing = await this.prisma.user.findUnique({
      where: { username: dto.username },
      select: { id: true },
    });
    if (existing) throw new ConflictException('El nombre de usuario ya está en uso');

    const hashedPassword = await argon2.hash(dto.password, { type: argon2.argon2id });

    const newUser = await this.prisma.user.create({
      data: {
        name: dto.name,
        lastName: dto.lastName,
        username: dto.username,
        password: hashedPassword,
        role: dto.role ?? 'USER',
      },
      select: SAFE_USER_SELECT,
    });

    await this.auditService.log({
      action: AuditAction.USER_CREATED,
      entity: 'User',
      entityId: newUser.id,
      userId: adminUser.sub,
      username: adminUser.username,
      ipAddress,
      details: JSON.stringify({ createdUsername: newUser.username, role: newUser.role }),
    });

    return newUser;
  }

  async update(id: number, dto: UpdateUserDto, adminUser: JwtPayload, ipAddress?: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true, username: true },
    });
    if (!existingUser) throw new NotFoundException(`Usuario con ID ${id} no encontrado`);

    const updateData: any = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.lastName !== undefined) updateData.lastName = dto.lastName;
    if (dto.role !== undefined) updateData.role = dto.role;
    if (dto.password) {
      updateData.password = await argon2.hash(dto.password, { type: argon2.argon2id });
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: SAFE_USER_SELECT,
    });

    if (dto.role && dto.role !== existingUser.role) {
      await this.auditService.log({
        action: AuditAction.USER_ROLE_CHANGED,
        entity: 'User',
        entityId: id,
        userId: adminUser.sub,
        username: adminUser.username,
        ipAddress,
        details: JSON.stringify({
          targetUsername: existingUser.username,
          previousRole: existingUser.role,
          newRole: dto.role,
        }),
      });
    } else {
      await this.auditService.log({
        action: AuditAction.USER_UPDATED,
        entity: 'User',
        entityId: id,
        userId: adminUser.sub,
        username: adminUser.username,
        ipAddress,
        details: JSON.stringify({ targetUsername: existingUser.username }),
      });
    }

    return updatedUser;
  }

  async remove(id: number, adminUser: JwtPayload, ipAddress?: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, username: true, role: true },
    });
    if (!existingUser) throw new NotFoundException(`Usuario con ID ${id} no encontrado`);

    const taskCount = await this.prisma.task.count({ where: { userId: id } });
    if (taskCount > 0) {
      throw new ConflictException(
        `No se puede eliminar el usuario. Tiene ${taskCount} tarea(s) asociada(s).`,
      );
    }

    await this.prisma.user.delete({ where: { id } });

    await this.auditService.log({
      action: AuditAction.USER_DELETED,
      entity: 'User',
      entityId: id,
      userId: adminUser.sub,
      username: adminUser.username,
      ipAddress,
      details: JSON.stringify({ deletedUsername: existingUser.username, deletedRole: existingUser.role }),
    });

    return { message: `Usuario ${existingUser.username} eliminado correctamente` };
  }
}
