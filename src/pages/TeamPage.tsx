import { Link, useParams } from "react-router-dom";
import { useFootball } from "../hooks/useFootball";
import type { League, SearchResult } from "../types/football";
import { Media } from "../components/common/Media";
import { QueryState } from "../components/common/QueryState";
import { LeagueCards } from "../components/league/LeagueCards";
import { FixtureList } from "../components/fixtures/FixtureList";
function Competitions({ id }: { id: string }) {
  const query = useFootball<League>(`leagues?team=${id}&current=true`);
  return (
    <section className="panel">
      <div className="section-title">
        <h2>Competiciones actuales</h2>
        <span>EXPLORA</span>
      </div>
      <QueryState
        query={query}
        empty="No hay competiciones actuales disponibles para este equipo."
      />
      <LeagueCards leagues={query.data} />
    </section>
  );
}
export function TeamPage() {
  const { id = "" } = useParams();
  const valid = /^[1-9]\d{0,8}$/.test(id);
  const query = useFootball<SearchResult>(valid ? `teams?id=${id}` : null);
  const item = query.data[0];
  if (!valid)
    return (
      <div className="notice">
        El identificador del equipo no es válido.{" "}
        <Link to="/teams">Buscar equipos</Link>
      </div>
    );
  return (
    <>
      <Link className="back-link" to="/teams">
        ← Explorar equipos
      </Link>
      <QueryState query={query} empty="No encontramos este equipo." />
      {item && (
        <>
          <section className="team-hero">
            <Media
              src={item.venue?.image}
              kind="stadium"
              alt=""
              className="hero-background"
            />
            <div className="team-hero-content">
              <Media src={item.team.logo} alt={`Escudo de ${item.team.name}`} />
              <div>
                <div className="eyebrow">DENTRO DEL CLUB</div>
                <h1>{item.team.name}</h1>
                <p>
                  {[
                    item.team.country,
                    item.team.founded
                      ? `Fundado en ${item.team.founded}`
                      : null,
                    item.venue?.name,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
            </div>
          </section>
          <div className="detail-grid">
            <section className="panel">
              <div className="section-title">
                <h2>La casa del equipo</h2>
                <span>ESTADIO</span>
              </div>
              <Media
                src={item.venue?.image}
                kind="stadium"
                alt={item.venue?.name || "Estadio sin imagen disponible"}
                className="venue-image"
              />
              {item.venue ? (
                <>
                  <h3 className="venue-name">
                    {item.venue.name || "Información del estadio"}
                  </h3>
                  <dl className="facts">
                    {Object.entries({
                      Ciudad: item.venue.city,
                      Dirección: item.venue.address,
                      Capacidad: item.venue.capacity?.toLocaleString("es"),
                      Superficie: item.venue.surface,
                    })
                      .filter(
                        ([, v]) => v !== null && v !== undefined && v !== "",
                      )
                      .map(([k, v]) => (
                        <div key={k}>
                          <dt>{k}</dt>
                          <dd>{v}</dd>
                        </div>
                      ))}
                  </dl>
                </>
              ) : (
                <p>El proveedor no ha incluido información del estadio.</p>
              )}
            </section>
            <Competitions id={id} />
          </div>
          <div className="detail-grid">
            <FixtureList teamId={id} />
            <FixtureList teamId={id} recent />
          </div>
        </>
      )}
    </>
  );
}
