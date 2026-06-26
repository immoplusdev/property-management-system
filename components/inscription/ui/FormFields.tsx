"use client";
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react";

interface FieldProps {
  label?: string;
  hint?: string;
  required?: boolean;
  span?: number;
  children: ReactNode;
}

export function Field({ label, hint, required, span, children }: FieldProps) {
  return (
    <div className="field" style={span ? { gridColumn: `span ${span}` } : undefined}>
      {label && (
        <label className="field-label">
          {label} {required && <span className="req">*</span>}
        </label>
      )}
      {children}
      {hint && <div className="field-help">{hint}</div>}
    </div>
  );
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  required?: boolean;
  span?: number;
  prefix?: string;
}

export function TextField({ label, hint, required, span, prefix, className, ...props }: TextFieldProps) {
  return (
    <Field label={label} hint={hint} required={required} span={span}>
      {prefix ? (
        <div className="input-group">
          <span className="prefix">{prefix}</span>
          <input {...props} />
        </div>
      ) : (
        <input className={`input ${className ?? ""}`} {...props} />
      )}
    </Field>
  );
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  required?: boolean;
  span?: number;
  rows?: number;
}

export function TextArea({ label, hint, required, span, rows = 3, ...props }: TextAreaProps) {
  return (
    <Field label={label} hint={hint} required={required} span={span}>
      <textarea className="textarea" rows={rows} {...props} />
    </Field>
  );
}

interface SelectOption {
  value?: string;
  label?: string;
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  required?: boolean;
  span?: number;
  options: (string | SelectOption)[];
}

export function SelectField({ label, hint, required, span, options, ...props }: SelectFieldProps) {
  return (
    <Field label={label} hint={hint} required={required} span={span}>
      <select className="select" {...props}>
        {options.map((o) => {
          const val = typeof o === "string" ? o : (o.value ?? o.label ?? "");
          const lbl = typeof o === "string" ? o : (o.label ?? o.value ?? "");
          return <option key={val} value={val}>{lbl}</option>;
        })}
      </select>
    </Field>
  );
}
