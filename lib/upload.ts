export async function uploadFile(file: File, path: string): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  body.append("path", path);
  const res = await fetch("/api/upload", { method: "POST", body });
  if (!res.ok) {
    const json = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(json.error ?? res.statusText);
  }
  const { url } = await res.json() as { url: string };
  return url;
}
