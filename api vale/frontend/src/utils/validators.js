/**
 * Utilidades de validación de formularios.
 * Estas funciones centralizan las reglas de validación para que sean
 * consistentes en toda la aplicación y fáciles de mantener.
 */

/**
 * Valida que el username cumpla con las reglas del backend:
 * - Mínimo 3 caracteres, máximo 100
 * - Solo letras, números, puntos y guiones bajos
 * @param {string} username
 * @returns {string|null} Mensaje de error o null si es válido
 */
export function validateUsername(username) {
  if (!username || username.trim().length === 0) {
    return 'El nombre de usuario es requerido.';
  }
  if (username.trim().length < 3) {
    return 'El nombre de usuario debe tener al menos 3 caracteres.';
  }
  if (username.trim().length > 100) {
    return 'El nombre de usuario no puede superar los 100 caracteres.';
  }
  return null;
}

/**
 * Valida que la contraseña cumpla con la política de seguridad del backend:
 * - Mínimo 8 caracteres
 * - Al menos una mayúscula
 * - Al menos una minúscula
 * - Al menos un número
 * - Al menos un símbolo especial (@$!%*?&)
 * @param {string} password
 * @returns {string|null} Mensaje de error o null si es válida
 */
export function validatePassword(password) {
  if (!password || password.length === 0) {
    return 'La contraseña es requerida.';
  }
  if (password.length < 8) {
    return 'La contraseña debe tener al menos 8 caracteres.';
  }
  if (!/[A-Z]/.test(password)) {
    return 'La contraseña debe incluir al menos una letra mayúscula.';
  }
  if (!/[a-z]/.test(password)) {
    return 'La contraseña debe incluir al menos una letra minúscula.';
  }
  if (!/\d/.test(password)) {
    return 'La contraseña debe incluir al menos un número.';
  }
  if (!/[@$!%*?&]/.test(password)) {
    return 'La contraseña debe incluir al menos un símbolo (@$!%*?&).';
  }
  return null;
}

/**
 * Valida que un campo de texto no esté vacío.
 * @param {string} value - Valor del campo
 * @param {string} fieldName - Nombre del campo para el mensaje de error
 * @returns {string|null} Mensaje de error o null si es válido
 */
export function isNotEmpty(value, fieldName = 'Este campo') {
  if (!value || value.trim().length === 0) {
    return `${fieldName} es requerido.`;
  }
  return null;
}

/**
 * Valida un nombre (nombre o apellido): mínimo 2, máximo 200 caracteres.
 * @param {string} name
 * @param {string} fieldName
 * @returns {string|null}
 */
export function validateName(name, fieldName = 'El nombre') {
  if (!name || name.trim().length === 0) {
    return `${fieldName} es requerido.`;
  }
  if (name.trim().length < 2) {
    return `${fieldName} debe tener al menos 2 caracteres.`;
  }
  if (name.trim().length > 200) {
    return `${fieldName} no puede superar los 200 caracteres.`;
  }
  return null;
}
