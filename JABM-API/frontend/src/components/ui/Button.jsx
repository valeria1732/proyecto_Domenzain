/**
 * Botón reutilizable con variantes, estados de carga y efecto glow.
 *
 * @param {string}  children   - Contenido del botón
 * @param {string}  variant    - Variante: 'primary' | 'secondary' | 'danger' | 'ghost'
 * @param {boolean} isLoading  - Si muestra spinner de carga
 * @param {boolean} disabled   - Si está deshabilitado
 * @param {string}  type       - Tipo de botón (submit, button)
 * @param {string}  className  - Clases adicionales
 * @param {object}  extraProps - Props adicionales
 */

const VARIANTS = {
  primary: `
    bg-gradient-to-r from-primary to-secondary
    hover:from-primary-dark hover:to-primary
    text-white shadow-lg shadow-primary/25
    hover:shadow-xl hover:shadow-primary/40
  `,
  secondary: `
    bg-dark-700 hover:bg-dark-600
    text-light-100 border border-light-400/10
    hover:border-light-400/30
  `,
  danger: `
    bg-gradient-to-r from-danger to-red-600
    hover:from-red-600 hover:to-red-700
    text-white shadow-lg shadow-danger/25
  `,
  ghost: `
    bg-transparent hover:bg-dark-700/50
    text-light-300 hover:text-light-100
  `,
};

export default function Button({
  children,
  variant = 'primary',
  isLoading = false,
  disabled = false,
  type = 'button',
  className = '',
  ...extraProps
}) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={`
        btn-glow relative inline-flex items-center justify-center
        rounded-xl px-6 py-3 font-semibold text-sm
        transition-all duration-300 ease-out
        active:scale-[0.97]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        ${VARIANTS[variant] || VARIANTS.primary}
        ${className}
      `}
      {...extraProps}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12" cy="12" r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
