import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../common/enums';

/**
 * DTO para cambiar el rol de un usuario.
 * Solo accesible por ADMIN.
 */
export class UpdateRoleDto {
  @ApiProperty({
    description: 'Nuevo rol del usuario',
    enum: Role,
    example: Role.ADMIN,
    enumName: 'Role',
  })
  @IsEnum(Role, { message: 'El rol debe ser USER o ADMIN' })
  @IsNotEmpty({ message: 'El rol es obligatorio' })
  role: Role;
}
