import { IsString, IsNotEmpty, IsOptional, IsEnum, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../common/enums/role.enum';

export class CreateUserDto {
  @ApiProperty({ example: 'Juan', description: 'Nombre del usuario' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MinLength(2, { message: 'Mínimo 2 caracteres' })
  @MaxLength(200, { message: 'Máximo 200 caracteres' })
  name: string;

  @ApiProperty({ example: 'Pérez García', description: 'Apellido(s)' })
  @IsString()
  @IsNotEmpty({ message: 'El apellido es requerido' })
  @MinLength(2, { message: 'Mínimo 2 caracteres' })
  @MaxLength(300, { message: 'Máximo 300 caracteres' })
  lastName: string;

  @ApiProperty({ example: 'juan.perez', description: 'Username único' })
  @IsString()
  @IsNotEmpty({ message: 'El username es requerido' })
  @MinLength(3, { message: 'Mínimo 3 caracteres' })
  @MaxLength(100, { message: 'Máximo 100 caracteres' })
  username: string;

  @ApiProperty({ example: 'MiPassword123!', description: 'Contraseña segura (mayúscula, minúscula, número, símbolo)' })
  @IsString()
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(8, { message: 'Mínimo 8 caracteres' })
  @MaxLength(72, { message: 'Máximo 72 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message: 'Debe tener mayúscula, minúscula, número y símbolo (@$!%*?&)',
  })
  password: string;

  @ApiProperty({ example: 'USER', enum: Role, required: false })
  @IsOptional()
  @IsEnum(Role, { message: 'El rol debe ser USER o ADMIN' })
  role?: Role;
}
