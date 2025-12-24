const Toggle = ({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`flex items-center justify-between w-full px-4 py-3 rounded-lg border transition
      ${checked
        ? 'border-blue-600 bg-blue-50'
        : 'border-gray-300 bg-white hover:bg-gray-50'}`}
  >
    <span className="text-sm font-medium text-gray-800">
      {label}
    </span>

    <span
      className={`relative inline-flex h-5 w-10 rounded-full transition
        ${checked ? 'bg-blue-600' : 'bg-gray-300'}`}
    >
      <span
        className={`absolute left-0 top-0 h-5 w-5 rounded-full bg-white shadow transform transition
          ${checked ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </span>
  </button>
);
export default Toggle;