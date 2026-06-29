"use client";
import { useEffect, useRef, useState } from "react";
import { uploadFile } from "@/lib/api/files/files.client";
import { fileUrl } from "@/lib/utils/fileUrl";
import { ThumbAdd } from "./Thumb";
import { Icon } from "./Icon";

interface PhotoItem {
  fileId: string;
  previewUrl: string | null;
}

interface PhotoGalleryProps {
  imageIds: string[];
  onChange: (ids: string[]) => void;
  hint?: string;
}

function Spinner() {
  return (
    <svg className="animate-spin w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

export function PhotoGallery({ imageIds, onChange, hint }: PhotoGalleryProps) {
  const [items, setItems] = useState<PhotoItem[]>(() =>
    imageIds.map((id) => ({ fileId: id, previewUrl: fileUrl(id) }))
  );
  const [uploading, setUploading] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep a stable ref to onChange so the effect doesn't re-run when parent re-renders
  const onChangeFn = useRef(onChange);
  onChangeFn.current = onChange;
  const isFirstMount = useRef(true);

  // Sync items → parent AFTER render, never during render
  useEffect(() => {
    if (isFirstMount.current) { isFirstMount.current = false; return; }
    onChangeFn.current(items.map((i) => i.fileId));
  }, [items]);

  const remove = (fileId: string) => {
    setItems((prev) => {
      const found = prev.find((i) => i.fileId === fileId);
      if (found?.previewUrl) URL.revokeObjectURL(found.previewUrl);
      return prev.filter((i) => i.fileId !== fileId);
    });
  };

  const handleFiles = async (files: FileList) => {
    const arr = Array.from(files);
    setUploading((n) => n + arr.length);
    await Promise.all(arr.map(async (file) => {
      const previewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : null;
      try {
        const uploaded = await uploadFile(file);
        // Plain setItems — no onChange call inside the updater (that causes the render bug)
        setItems((prev) => [...prev, { fileId: uploaded.id, previewUrl }]);
      } catch {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
      } finally {
        setUploading((n) => n - 1);
      }
    }));
  };

  return (
    <div className="flex flex-col gap-2">
      {hint && <div className="text-[11.5px] text-ink-3">{hint}</div>}
      <div className="grid gap-2.5 grid-cols-[repeat(auto-fill,minmax(100px,1fr))]">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) handleFiles(e.target.files);
            e.target.value = "";
          }}
        />

        {items.map((item) => (
          <div key={item.fileId} className="relative aspect-4/3 rounded-xl overflow-hidden bg-surface-2 group">
            {item.previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.previewUrl}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-ink-4">
                <Icon name="image" size={22} />
              </div>
            )}
            <button
              type="button"
              aria-label="Retirer"
              onClick={() => remove(item.fileId)}
              className="absolute top-1.5 right-1.5 z-10 w-6 h-6 rounded-md bg-black/55 text-white grid place-items-center cursor-pointer hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Icon name="x" size={12} />
            </button>
          </div>
        ))}

        {Array.from({ length: uploading }).map((_, i) => (
          <div key={`spin-${i}`} className="aspect-4/3 rounded-xl bg-primary-50 flex items-center justify-center">
            <Spinner />
          </div>
        ))}

        <ThumbAdd onClick={() => inputRef.current?.click()} />
      </div>
    </div>
  );
}
