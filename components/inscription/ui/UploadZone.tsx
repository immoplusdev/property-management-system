"use client";
import { Icon } from "./Icon";

interface UploadZoneProps {
  title: string;
  sub?: string;
  icon?: string;
  onClick?: () => void;
}

export function UploadZone({ title, sub, icon = "upload", onClick }: UploadZoneProps) {
  return (
    <div className="upload-zone" onClick={onClick}>
      <div className="uz-icon">
        <Icon name={icon} size={22} />
      </div>
      <div className="uz-title">{title}</div>
      {sub && <div className="uz-sub">{sub}</div>}
    </div>
  );
}
