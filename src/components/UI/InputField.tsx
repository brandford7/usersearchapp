
interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function InputField({
  label,
  value,
  onChange,
  placeholder = "",
}: InputFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-400 ml-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm 
                   focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 
                   transition-all placeholder-gray-600"
      />
    </div>
  );
}
