import React from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  help?: string;
  error?: string;
}

export function Textarea({ label, help, error, id, className = "", ...props }: TextareaProps) {
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
      <textarea
        {...props}
        id={fieldId}
        className={"textarea " + className}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : undefined}
      />
      {error && (
        <div id={`${fieldId}-error`} role="alert" style={{ fontSize: 12, color: "var(--danger)", marginTop: 4 }}>
          {error}
        </div>
      )}
    </div>
  );
}
