import type { Query } from "../../hooks/useFootball";
import { Icon } from "./Media";
export function QueryState<T>({
  query,
  empty = "No hay información disponible.",
}: {
  query: Query<T>;
  empty?: string;
}) {
  if (query.status === "loading")
    return (
      <div
        className="skeletons"
        role="status"
        aria-label="Cargando información"
      >
        <div />
        <div />
        <div />
        <span className="sr-only">Cargando…</span>
      </div>
    );
  if (query.status === "error")
    return (
      <div className="notice error" role="alert">
        <Icon name="error" />
        <div>
          <strong>No pudimos cargar esta información</strong>
          <p>{query.error}</p>
          <button className="text-button" onClick={query.retry}>
            Reintentar ↗
          </button>
        </div>
      </div>
    );
  if (query.status === "empty")
    return (
      <div className="notice">
        <Icon name="search" />
        <p>{empty}</p>
      </div>
    );
  return null;
}
