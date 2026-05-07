/**
 * Input reutilizable con icono, validación visual y animaciones.
 *
 * @param {string}   id          - ID único del input
 * @param {string}   type        - Tipo de input (text, email, password)
 * @param {string}   label       - Label del campo
 * @param {string}   value       - Valor controlado
 * @param {function} onChange     - Callback de cambio
 * @param {string}   placeholder - Placeholder del input
 * @param {string}   icon        - SVG string del icono
 * @param {string}   error       - Mensaje de error
 * @param {boolean}  disabled    - Si está deshabilitado
 * @param {object}   extraProps  - Props adicionales para el input
 */
export default function Input({
  id,
  type = 'text',
  label,
  value,
  onChange,
  placeholder,
  icon,
  error,
  disabled = false,
  ...extraProps
}) {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-semibold text-white ml-1"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {icon && (
          <div
            className="absolute left-4 text-[var(--color-light-400)] pointer-events-none"
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: icon }}
          />
        )}

        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full rounded-xl border bg-[#1e293b]/60 px-4 py-3.5
            text-white placeholder-[var(--color-light-500)]
            transition-all duration-300
            focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]
            hover:border-[var(--color-light-400)]/30 backdrop-blur-sm
            disabled:opacity-50 disabled:cursor-not-allowed
            ${icon ? 'pl-11' : ''}
            ${error
              ? 'border-[var(--color-danger)]/50 focus:ring-[var(--color-danger)]/50 focus:border-[var(--color-danger)]'
              : 'border-[var(--color-dark-600)]'
            }
          `}
          {...extraProps}
        />
      </div>

      {error && (
        <p className="text-[var(--color-danger)] text-sm ml-1 font-medium animate-slide-down" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
