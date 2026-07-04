import React from "react";
import { cn } from "@/lib/utils/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  help?: string;
  error?: string;
}

export function Input({ label, help, error, id, className = "", ...props }: InputProps) {
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
  return (
    <div>
      {label && (
        <label className="text-[12px] font-medium text-ink-2 mb-1.5 block" htmlFor={inputId}>
          {label}
          {props.required && <span aria-hidden="true" className="text-danger ml-0.5">*</span>}
        </label>
      )}
      {help && <div className="text-[12px] text-ink-3 mb-1">{help}</div>}
      <input
        {...props}
        id={inputId}
        className={cn(
          "w-full h-10.5 bg-surface border border-border rounded-[10px] px-3 text-[13.5px] text-ink outline-none focus:border-primary disabled:opacity-60 disabled:cursor-not-allowed",
          error && "border-danger",
          className
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
      />
      {error && (
        <div id={`${inputId}-error`} role="alert" className="text-[12px] text-danger mt-1">
          {error}
        </div>
      )}
    </div>
  );
}
