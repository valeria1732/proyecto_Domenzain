import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../common/enums';

export class CreateUserDto {
  @ApiProperty({ description: 'Nombre completo del nuevo usuario' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  name: string;

  @ApiProperty({ description: 'Correo electrónico válido' })
  @IsEmail({}, { message: 'Formato de email inválido' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  email: string;

  @ApiProperty({ description: 'Contraseña para el nuevo usuario', minLength: 6 })
  @IsString()
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @ApiProperty({ description: 'Rol asignado al usuario', enum: Role, default: Role.USER })
  @IsOptional()
  @IsEnum(Role, { message: 'El rol debe ser USER o ADMIN' })
  role?: Role;
}
