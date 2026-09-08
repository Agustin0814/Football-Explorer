import type { ApiResponse, ErrorResponse } from "../types/football";
const cache = new Map<string, { expires: number; data: unknown[] }>();
const pending = new Map<string, Promise<unknown[]>>();
export async function footballApi<T>(path: string): Promise<T[]> {
  const item = cache.get(path);
  if (item && item.expires > Date.now()) return item.data as T[];
  const active = pending.get(path);
  if (active) return active as Promise<T[]>;
  const promise = (async () => {
    let response: Response;
    try {
      response = await fetch(`/api/${path}`, {
        signal: AbortSignal.timeout(16_000),
      });
    } catch {
      throw new Error(
        "No hay conexión con el servidor. Comprueba tu conexión e inténtalo de nuevo.",
      );
    }
    let body: ApiResponse<T> & ErrorResponse;
    try {
      body = await response.json();
    } catch {
      throw new Error("El servidor no está disponible. Inténtalo de nuevo.");
    }
    if (!response.ok)
      throw new Error(
        body?.error?.message || "No se pudo completar la consulta.",
      );
    if (!body || !Array.isArray(body.response))
      throw new Error("La respuesta recibida no es válida.");
    if (cache.size >= 200) cache.delete(cache.keys().next().value!);
    cache.set(path, {
      data: body.response,
      expires:
        Date.now() +
        (path.startsWith("fixtures") ? 10 * 60_000 : 6 * 60 * 60_000),
    });
    return body.response;
  })();
  pending.set(path, promise);
  try {
    return await promise;
  } finally {
    pending.delete(path);
  }
}
