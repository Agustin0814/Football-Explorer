import type { ApiResponse } from "../src/types/football.js";
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}
export function queryFor(
  resource: string,
  query: Record<string, unknown>,
): { path: string; ttl: number } {
  const keys = Object.keys(query).sort().join(",");
  const id = (value: unknown) =>
    typeof value === "string" && /^[1-9]\d{0,8}$/.test(value);
  let valid = false;
  if (resource === "teams")
    valid =
      (keys === "id" && id(query.id)) ||
      (keys === "search" &&
        typeof query.search === "string" &&
        query.search.trim().length >= 3 &&
        query.search.trim().length <= 80);
  if (resource === "leagues")
    valid =
      (keys === "id" && id(query.id)) ||
      (keys === "current,team" && id(query.team) && query.current === "true");
  if (resource === "fixtures")
    valid =
      ((keys === "next,team" && query.next === "5") ||
        (keys === "last,team" && query.last === "5")) &&
      id(query.team);
  if (!valid)
    throw new ApiError(400, "INVALID_QUERY", "La consulta no es válida.");
  const params = new URLSearchParams();
  for (const key of Object.keys(query).sort())
    params.set(key, String(query[key]).trim());
  return {
    path: `${resource}?${params}`,
    ttl: resource === "fixtures" ? 10 * 60_000 : 6 * 60 * 60_000,
  };
}
export function createFootballClient(
  fetcher: typeof fetch = fetch,
  getKey = () => process.env.API_FOOTBALL_KEY,
) {
  const cache = new Map<
    string,
    { expires: number; data: ApiResponse<unknown> }
  >();
  const pending = new Map<string, Promise<ApiResponse<unknown>>>();
  return async (resource: string, query: Record<string, unknown>) => {
    const { path, ttl } = queryFor(resource, query);
    const cached = cache.get(path);
    if (cached && cached.expires > Date.now()) return cached.data;
    const existing = pending.get(path);
    if (existing) return existing;
    const key = getKey()?.trim();
    if (!key)
      throw new ApiError(
        503,
        "NOT_CONFIGURED",
        "Añade API_FOOTBALL_KEY al archivo .env del servidor y reinícialo para comenzar.",
      );
    const request = (async () => {
      let response: Response;
      try {
        response = await fetcher(`https://v3.football.api-sports.io/${path}`, {
          headers: { "x-apisports-key": key },
          signal: AbortSignal.timeout(12_000),
        });
      } catch {
        throw new ApiError(
          502,
          "NETWORK",
          "No pudimos conectar con API-Football. Inténtalo de nuevo.",
        );
      }
      if (response.status === 429)
        throw new ApiError(
          429,
          "QUOTA",
          "Se alcanzó temporalmente el límite de consultas de la API.",
        );
      if ([401, 403].includes(response.status))
        throw new ApiError(
          503,
          "AUTH",
          "La API rechazó el acceso. Revisa la clave y el plan en el servidor.",
        );
      if (!response.ok)
        throw new ApiError(
          502,
          "UNAVAILABLE",
          "API-Football no está disponible en este momento.",
        );
      let data: ApiResponse<unknown>;
      try {
        data = (await response.json()) as ApiResponse<unknown>;
      } catch {
        throw new ApiError(
          502,
          "INVALID_RESPONSE",
          "La API devolvió una respuesta no válida.",
        );
      }
      if (data?.errors && Object.keys(data.errors).length) {
        const error = JSON.stringify(data.errors).toLowerCase();
        if (/rate.?limit|quota|requests|too many/.test(error))
          throw new ApiError(
            429,
            "QUOTA",
            "Se alcanzó temporalmente el límite de consultas de la API.",
          );
        if (/plan|subscription|season|access/.test(error))
          throw new ApiError(
            403,
            "PLAN",
            "Estos datos no están disponibles con el plan o la temporada de tu cuenta de API-Football.",
          );
        throw new ApiError(
          502,
          "PROVIDER",
          "API-Football no pudo completar la consulta. Revisa la configuración de tu cuenta.",
        );
      }
      if (!data || !Array.isArray(data.response))
        throw new ApiError(
          502,
          "INVALID_RESPONSE",
          "La API devolvió una respuesta no válida.",
        );
      const safe = { response: data.response, results: data.response.length };
      if (cache.size >= 500) cache.delete(cache.keys().next().value!);
      cache.set(path, { expires: Date.now() + ttl, data: safe });
      return safe;
    })();
    pending.set(path, request);
    try {
      return await request;
    } finally {
      pending.delete(path);
    }
  };
}
