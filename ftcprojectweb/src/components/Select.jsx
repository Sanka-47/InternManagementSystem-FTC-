export default function Select({ label, value, onChange, children, ...props }) {
  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-medium mb-1">{label}</label>}
      <select
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        {...props}
      >
        {children}
      </select>
    </div>
  );
}
