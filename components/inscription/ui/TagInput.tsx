"use client";
import { useState } from "react";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export function TagInput({ tags, onChange, placeholder = "Tapez et appuyez sur Entrée" }: TagInputProps) {
  const [value, setValue] = useState("");

  const submit = () => {
    const v = value.trim();
    if (v && !tags.includes(v)) onChange([...tags, v]);
    setValue("");
  };

  return (
    <div className="min-h-11.5 px-2.5 py-1.75 border-[1.5px] border-border rounded-xl bg-surface flex flex-wrap gap-1.5 items-center transition-[border-color,box-shadow] duration-150 focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(39,68,222,0.10)]">
      {tags.map((t) => (
        <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-50 text-primary text-[12px] font-semibold border border-primary-100">
          {t}
          <button
            type="button"
            aria-label={`Retirer ${t}`}
            className="cursor-pointer opacity-60 text-[14px] leading-none transition-opacity duration-150 hover:opacity-100"
            onClick={() => onChange(tags.filter((x) => x !== t))}
          >
            ×
          </button>
        </span>
      ))}
      <input
        className="flex-1 min-w-25 border-0 outline-none bg-transparent text-[14px] text-ink px-1 py-0.5 placeholder:text-ink-4"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            submit();
          }
        }}
        placeholder={tags.length === 0 ? placeholder : ""}
      />
    </div>
  );
}
