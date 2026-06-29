"use client";
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react";

// Shared field control styling (single source for inscription form controls).
export const CONTROL =
  "w-full px-3.5 h-11 bg-surface border-[1.5px] border-border rounded-xl text-[14px] text-ink outline-none " +
  "font-[inherit] transition-[border-color,box-shadow] duration-150 placeholder:text-ink-4 " +
  "focus:border-primary focus:shadow-[0_0_0_3px_rgba(39,68,222,0.10)]";

export const SELECT_CHEVRON =
  "data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%237C7C8E' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E";

interface FieldProps {
  label?: string;
  hint?: string;
  required?: boolean;
  span?: number;
  className?: string;
  children: ReactNode;
}

export function Field({ label, hint, required, span, className, children }: FieldProps) {
  return (
    <div className={`flex flex-col${className ? ` ${className}` : ""}`} style={span ? { gridColumn: `span ${span}` } : undefined}>
      {label && (
        <label className="text-[11px] font-bold tracking-[0.05em] uppercase text-ink-2 mb-1.75">
          {label} {required && <span className="text-danger ml-0.5">*</span>}
        </label>
      )}
      {children}
      {hint && <div className="text-[11.5px] text-ink-3 mt-1.5 leading-[1.4]">{hint}</div>}
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
        <div className="flex items-center bg-surface border-[1.5px] border-border rounded-xl overflow-hidden transition-[border-color,box-shadow] duration-150 focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(39,68,222,0.10)]">
          <span className="px-3 h-11 flex items-center bg-surface-2 border-r-[1.5px] border-border text-[13px] text-ink-2 whitespace-nowrap">{prefix}</span>
          <input className="flex-1 border-0 outline-none px-3.5 h-11 text-[14px] bg-transparent text-ink placeholder:text-ink-4" {...props} />
        </div>
      ) : (
        <input className={`${CONTROL} ${className ?? ""}`} {...props} />
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

export function TextArea({ label, hint, required, span, rows = 3, className, ...props }: TextAreaProps) {
  return (
    <Field label={label} hint={hint} required={required} span={span}>
      <textarea className={`${CONTROL} h-auto py-3 resize-y ${className ?? ""}`} rows={rows} {...props} />
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

export function SelectField({ label, hint, required, span, options, className, ...props }: SelectFieldProps) {
  return (
    <Field label={label} hint={hint} required={required} span={span}>
      <select
        className={`${CONTROL} appearance-none bg-no-repeat bg-position-[right_14px_center] pr-9 ${className ?? ""}`}
        style={{ backgroundImage: `url("${SELECT_CHEVRON}")` }}
        {...props}
      >
        {options.map((o) => {
          const val = typeof o === "string" ? o : (o.value ?? o.label ?? "");
          const lbl = typeof o === "string" ? o : (o.label ?? o.value ?? "");
          return <option key={val} value={val}>{lbl}</option>;
        })}
      </select>
    </Field>
  );
}
