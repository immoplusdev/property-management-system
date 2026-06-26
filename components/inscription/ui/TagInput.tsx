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
    <div className="tag-input">
      {tags.map((t) => (
        <span key={t} className="tag">
          {t}
          <span
            className="x"
            onClick={() => onChange(tags.filter((x) => x !== t))}
          >
            ×
          </span>
        </span>
      ))}
      <input
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
