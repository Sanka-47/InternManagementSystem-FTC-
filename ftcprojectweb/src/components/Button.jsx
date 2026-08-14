export default function Button({ children, onClick, type = "button", disabled = false, className = "" , ...props}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl px-4 py-2 font-medium text-white disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
