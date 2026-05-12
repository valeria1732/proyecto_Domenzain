import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'juan.perez', description: 'Nombre de usuario' })
  @IsString({ message: 'El nombre de usuario debe ser texto' })
  @IsNotEmpty({ message: 'El nombre de usuario es requerido' })
  @MinLength(3, { message: 'Mínimo 3 caracteres' })
  @MaxLength(100, { message: 'Máximo 100 caracteres' })
  username: string;

  @ApiProperty({ example: 'MiPassword123!', description: 'Contraseña' })
  @IsString({ message: 'La contraseña debe ser texto' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(8, { message: 'Mínimo 8 caracteres' })
  @MaxLength(72, { message: 'Máximo 72 caracteres' })
  password: string;
}
