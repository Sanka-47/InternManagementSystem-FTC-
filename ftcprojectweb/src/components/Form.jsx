export default function Form({ title, subtitle, onSubmit, children, className = "" }) {
  return (
    <form
      onSubmit={onSubmit}
      className={`max-w-md w-full bg-white rounded-2xl shadow-lg p-6 mx-auto ${className}`}
    >
      {title && <h1 className="text-2xl font-semibold text-gray-800 mb-1">{title}</h1>}
      {subtitle && <p className="text-sm text-gray-500 mb-4">{subtitle}</p>}
      {children}
    </form>
  );
}
