export default function FormField({ label, error, required, ...props }) {
  return (
    <div className="mb-4">
      {label && (
        <label className="label">
          {label}
          {required && <span className="text-red-600">*</span>}
        </label>
      )}
      {props.type === 'textarea' ? (
        <textarea
          {...props}
          className={`input-field ${error ? 'border-red-500' : ''}`}
        />
      ) : (
        <input
          {...props}
          className={`input-field ${error ? 'border-red-500' : ''}`}
        />
      )}
      {error && <p className="text-error text-sm mt-1">{error}</p>}
    </div>
  );
}
