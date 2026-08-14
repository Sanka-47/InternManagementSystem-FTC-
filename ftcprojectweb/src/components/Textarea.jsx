export default function Textarea({ label, value, onChange, placeholder = "", rows = 4, ...props }) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium mb-1">
          {label}
        </label>
      )}
      <textarea
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                   focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                   shadow-sm"
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        {...props}  
      />
    </div>
  );
}
