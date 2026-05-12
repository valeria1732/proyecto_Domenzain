import { IsString, IsNotEmpty, IsOptional, IsEnum, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../common/enums/role.enum';

export class UpdateUserDto {
  @ApiProperty({ example: 'Juan', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(200)
  name?: string;

  @ApiProperty({ example: 'Pérez García', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(300)
  lastName?: string;

  @ApiProperty({ example: 'NuevaPassword123!', required: false })
  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'Mínimo 8 caracteres' })
  @MaxLength(72, { message: 'Máximo 72 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message: 'Debe tener mayúscula, minúscula, número y símbolo',
  })
  password?: string;

  @ApiProperty({ example: 'ADMIN', enum: Role, required: false })
  @IsOptional()
  @IsEnum(Role, { message: 'El rol debe ser USER o ADMIN' })
  role?: Role;
}
