export default function Alert({ type = 'info', title, message, onClose }) {
  const bgColor = {
    success: 'bg-green-100 border-green-400',
    error: 'bg-red-100 border-red-400',
    warning: 'bg-yellow-100 border-yellow-400',
    info: 'bg-blue-100 border-blue-400',
  }[type];

  const textColor = {
    success: 'text-green-800',
    error: 'text-red-800',
    warning: 'text-yellow-800',
    info: 'text-blue-800',
  }[type];

  return (
    <div className={`${bgColor} ${textColor} border-l-4 p-4 rounded mb-4`}>
      <div className="flex justify-between items-start">
        <div>
          {title && <p className="font-semibold">{title}</p>}
          <p className="text-sm">{message}</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-xl font-bold">
            ×
          </button>
        )}
      </div>
    </div>
  );
}
