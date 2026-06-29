export interface UploadedFile {
  id: string;
  title: string;
  fileNameDisk: string;
  fileNameDownload: string;
  type: string;
}

export async function uploadFile(file: File): Promise<UploadedFile> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("title", file.name);

  // Content-Type intentionally omitted — browser must set multipart/form-data with boundary
  const res = await fetch("/bff/files", {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let message = `Erreur ${res.status}`;
    try {
      const json = JSON.parse(text);
      message = json.message ?? json.error ?? message;
    } catch {
      // keep default message
    }
    throw new Error(message);
  }

  const json = await res.json();
  return json.data as UploadedFile;
}
