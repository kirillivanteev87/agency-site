/** fetch + JSON для админки: при ошибке тело читается один раз (без «body stream already read»). */
export async function adminFetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, credentials: "include" });
  if (!res.ok) {
    if (res.status === 413) {
      throw new Error(
        "Файл слишком большой для сервера (у Vercel и др. часто лимит ~4.5 МБ на запрос). Сожмите видео, используйте WebM, или загрузите на облако и вставьте URL в поле.",
      );
    }
    const text = await res.text();
    let message = `Ошибка ${res.status}`;
    if (text) {
      try {
        const body = JSON.parse(text) as { error?: string };
        if (typeof body?.error === "string" && body.error.trim()) {
          message = body.error;
        } else {
          message = text;
        }
      } catch {
        message = text;
      }
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}
