import React from "react";

type Props = {
  label: string;
  name?: string;
  value?: string | number | undefined;
  onChange?: (e: React.ChangeEvent<any>) => void;
  type?: string;
  required?: boolean;
  children?: React.ReactNode;
  className?: string;
  multiline?: boolean;
  rows?: number;
  checked?: boolean;
};

export default function FormField({
  label,
  name,
  value,
  onChange,
  type = "text",
  required,
  children,
  className = "",
  multiline = false,
  rows = 4,
}: Props) {
  const baseInputClasses = "w-full border-0 border-b border-gray-300 rounded-none hover:border-gray-400 focus:ring-0 focus:border-blue-600 outline-none disabled:border-gray-200 disabled:bg-transparent disabled:text-gray-500 aria-invalid:border-red-500 aria-invalid:focus:border-red-600";
  
  return (
    <div className="flex flex-col gap-1">
      <label className="font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {children ? (
        children
      ) : multiline ? (
        <textarea
          name={name}
          value={value ?? ""}
          onChange={onChange}
          required={required}
          rows={rows}
          className={`${baseInputClasses} resize-y align-top ${className}`} // <-- Added resize-y and align-top
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value ?? ""}
          onChange={onChange}
          required={required}
          className={`${baseInputClasses} ${className}`}
        />
      )}
    </div>
  );
}
