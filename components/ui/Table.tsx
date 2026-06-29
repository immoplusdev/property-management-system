import React from "react";
import { cn } from "@/lib/utils/cn";

export interface Column<T> {
  key: keyof T | string;
  header: string;
  width?: string | number;
  align?: "left" | "right" | "center";
  render?: (row: T, index: number) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string;
  caption?: string;
  emptyLabel?: string;
  onRowClick?: (row: T) => void;
  className?: string;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  caption,
  emptyLabel = "Aucun résultat",
  onRowClick,
  className,
}: TableProps<T>) {
  return (
    <table
      className={cn("w-full border-collapse text-[13px]", className)}
      role="table"
      aria-label={caption}
    >
      {caption && <caption className="sr-only">{caption}</caption>}
      <thead>
        <tr>
          {columns.map(col => (
            <th
              key={String(col.key)}
              scope="col"
              className="text-left font-medium text-ink-3 text-[11.5px] px-3.5 py-2.5 border-b border-border bg-transparent tracking-[0.01em]"
              style={col.width ? { width: col.width } : undefined}
            >
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr>
            <td
              colSpan={columns.length}
              className="text-center px-4 py-8 text-ink-3"
            >
              {emptyLabel}
            </td>
          </tr>
        ) : (
          data.map((row, i) => (
            <tr
              key={keyExtractor(row, i)}
              className={cn(
                "[&_td]:border-b [&_td]:border-border-soft last:[&_td]:border-b-0",
                "hover:[&_td]:bg-surface-2 transition-colors",
                onRowClick && "cursor-pointer"
              )}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map(col => (
                <td
                  key={String(col.key)}
                  className={cn(
                    "px-3.5 py-3.5 align-middle",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center"
                  )}
                >
                  {col.render
                    ? col.render(row, i)
                    : String((row as Record<string, unknown>)[String(col.key)] ?? "—")}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
