"use client";
import React, { useId } from "react";

/* ── Single Radio ── */
interface RadioProps {
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  label?: string;
  name?: string;
  disabled?: boolean;
}

export function Radio({ value, checked, onChange, label, disabled }: RadioProps) {
  const uid = useId();
  return (
    <label
      htmlFor={uid}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <span
        role="radio"
        id={uid}
        aria-checked={checked}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && onChange(value)}
        onKeyDown={e => {
          if ((e.key === " " || e.key === "Enter") && !disabled) {
            e.preventDefault();
            onChange(value);
          }
        }}
        style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          border: `1.5px solid ${checked ? "var(--primary)" : "var(--border-strong)"}`,
          background: checked ? "var(--primary)" : "var(--surface)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "all .12s ease",
          outline: "none",
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        {checked && (
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", display: "block" }} />
        )}
      </span>
      {label && (
        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{label}</span>
      )}
    </label>
  );
}

/* ── RadioGroup ── */
export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  disabled?: boolean;
}

export function RadioGroup({ options, value, onChange, label, disabled }: RadioGroupProps) {
  return (
    <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
      {label && (
        <legend style={{ fontSize: 12.5, fontWeight: 500, color: "var(--text)", marginBottom: 10 }}>
          {label}
        </legend>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }} role="radiogroup" aria-label={label}>
        {options.map(opt => {
          const isChecked = value === opt.value;
          const isDisabled = disabled || opt.disabled;
          return (
            <label
              key={opt.value}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                cursor: isDisabled ? "not-allowed" : "pointer",
                opacity: isDisabled ? 0.5 : 1,
              }}
            >
              <span
                role="radio"
                aria-checked={isChecked}
                aria-disabled={isDisabled}
                tabIndex={isDisabled ? -1 : 0}
                onClick={() => !isDisabled && onChange(opt.value)}
                onKeyDown={e => {
                  if ((e.key === " " || e.key === "Enter") && !isDisabled) {
                    e.preventDefault();
                    onChange(opt.value);
                  }
                }}
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  border: `1.5px solid ${isChecked ? "var(--primary)" : "var(--border-strong)"}`,
                  background: isChecked ? "var(--primary)" : "var(--surface)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: 1,
                  transition: "all .12s ease",
                  outline: "none",
                  cursor: isDisabled ? "not-allowed" : "pointer",
                }}
              >
                {isChecked && (
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", display: "block" }} />
                )}
              </span>
              <span>
                <span style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text)" }}>
                  {opt.label}
                </span>
                {opt.description && (
                  <span style={{ display: "block", fontSize: 11.5, color: "var(--text-3)", marginTop: 2 }}>
                    {opt.description}
                  </span>
                )}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
