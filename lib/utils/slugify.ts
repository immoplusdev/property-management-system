const DIACRITICS = /[̀-ͯ]/g;

export function slugify(value: string): string {
  const slug = value
    .normalize("NFD")
    .replace(DIACRITICS, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "hotel";
}
