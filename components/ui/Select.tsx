import React from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  help?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export function Select({ label, help, error, options, placeholder, id, className = "", ...props }: SelectProps) {
  const fieldId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
  return (
    <div className="field">
      {label && (
        <label className="field-label" htmlFor={fieldId}>
          {label}
          {props.required && <span aria-hidden="true" style={{ color: "var(--danger)", marginLeft: 2 }}>*</span>}
        </label>
      )}
      {help && <div className="field-help">{help}</div>}
      <select
        {...props}
        id={fieldId}
        className={"select " + className}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : undefined}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && (
        <div id={`${fieldId}-error`} role="alert" style={{ fontSize: 12, color: "var(--danger)", marginTop: 4 }}>
          {error}
        </div>
      )}
    </div>
  );
}
