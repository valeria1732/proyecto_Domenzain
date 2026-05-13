/**
 * Utilidades de sanitización de entradas.
 *
 * CONTEXTO DE SEGURIDAD:
 * React ya escapa automáticamente el contenido renderizado con JSX ({variable}),
 * por lo que XSS a través de interpolación normal no es un riesgo.
 * Estas funciones son necesarias únicamente cuando se usan APIs peligrosas
 * como dangerouslySetInnerHTML, o cuando se mandan datos a APIs externas.
 *
 * REGLA: Evitar dangerouslySetInnerHTML. Si es inevitable, sanitizar primero.
 */

/**
 * Escapa caracteres HTML especiales para prevenir XSS en contextos de texto.
 * Úsalo antes de insertar strings dinámicos en contextos HTML no controlados.
 * @param {string} str - Texto a sanitizar
 * @returns {string} Texto con caracteres especiales escapados
 */
export function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Elimina espacios al inicio y final, y colapsa espacios múltiples internos.
 * Úsalo al leer valores de inputs antes de enviarlos al backend.
 * @param {string} str
 * @returns {string}
 */
export function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/\s+/g, ' ');
}

/**
 * Trunca un string a una longitud máxima para evitar inputs exageradamente largos
 * que puedan causar problemas de rendimiento o almacenamiento.
 * @param {string} str
 * @param {number} maxLength
 * @returns {string}
 */
export function truncate(str, maxLength = 200) {
  if (typeof str !== 'string') return '';
  return str.length > maxLength ? str.slice(0, maxLength) : str;
}
