import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  help?: string;
  error?: string;
}

export function Input({ label, help, error, id, className = "", ...props }: InputProps) {
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
  return (
    <div className="field">
      {label && (
        <label className="field-label" htmlFor={inputId}>
          {label}
          {props.required && <span aria-hidden="true" style={{ color: "var(--danger)", marginLeft: 2 }}>*</span>}
        </label>
      )}
      {help && <div className="field-help">{help}</div>}
      <input
        {...props}
        id={inputId}
        className={"input " + className}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
      />
      {error && (
        <div id={`${inputId}-error`} role="alert" style={{ fontSize: 12, color: "var(--danger)", marginTop: 4 }}>
          {error}
        </div>
      )}
    </div>
  );
}
