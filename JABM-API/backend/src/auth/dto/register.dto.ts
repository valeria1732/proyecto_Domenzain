import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para registro de usuario.
 *
 * Seguridad:
 * - Validación de fortaleza de contraseña con regex (mayúscula, minúscula, número, especial).
 * - Email validado con @IsEmail().
 * - whitelist: true en ValidationPipe elimina propiedades no definidas aquí.
 */
export class RegisterDto {
  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'Juan Pérez',
    minLength: 2,
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(200, { message: 'El nombre debe tener máximo 200 caracteres' })
  name: string;

  @ApiProperty({
    description: 'Correo electrónico único del usuario',
    example: 'juan@jabm.com',
  })
  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email: string;

  /**
   * Requisitos de contraseña:
   * - Mínimo 8 caracteres
   * - Al menos 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial
   * Esto mitiga ataques de fuerza bruta y diccionario.
   */
  @ApiProperty({
    description:
      'Contraseña segura. Mínimo 8 caracteres, debe incluir: 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial (@$!%*?&)',
    example: 'MiPassword1!',
    minLength: 8,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(50, { message: 'La contraseña debe tener máximo 50 caracteres' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
    {
      message:
        'La contraseña debe contener al menos: 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial (@$!%*?&)',
    },
  )
  password: string;
}
