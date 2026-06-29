/**
 * Returns the BFF proxy URL for a backend file ID.
 * Use this in <img src> for any file stored by the backend.
 * Returns null when id is falsy so callers can gate on it easily.
 */
export function fileUrl(id: string | null | undefined): string | null {
  if (!id) return null;
  return `/bff/files/raw/public/${id}`;
}
