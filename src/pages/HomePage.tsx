import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useFootball } from "../hooks/useFootball";
import type { SearchResult } from "../types/football";
import { Icon, Media } from "../components/common/Media";
import { QueryState } from "../components/common/QueryState";
export function HomePage() {
  const [params] = useSearchParams();
  const q = (params.get("q") || "").trim();
  const isHome = useLocation().pathname === "/";
  const result = useFootball<SearchResult>(
    q.length >= 3 ? `teams?search=${encodeURIComponent(q)}` : null,
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">TU PUNTO DE PARTIDA</div>
          <h1>
            {isHome
              ? "El mundo del fútbol, a tu alcance."
              : "Encuentra tu próximo club."}
          </h1>
          <p>
            Equipos, estadios y competiciones. Todo empieza con una búsqueda.
          </p>
        </div>
        <span className="outline-badge">EXPLORER / 01</span>
      </div>
      {!q && (
        <section className="home-hero">
          <div className="hero-copy">
            <span className="hero-tag">
              <span className="live-dot" /> LA PASIÓN NO TIENE FRONTERAS
            </span>
            <h2>
              Cada escudo
              <br />
              tiene una <em>historia.</em>
            </h2>
            <p>
              Descubre el club. Conoce su casa.
              <br />
              Sigue el camino de su próximo partido.
            </p>
            <a
              className="primary-button"
              href="#team-search"
              onClick={() => document.getElementById("team-search")?.focus()}
            >
              Explorar equipos <span>↗</span>
            </a>
          </div>
          <div className="field-art" aria-hidden="true">
            <div className="field-mark">
              <div className="field-circle" />
              <div className="field-line" />
              <div className="goal goal-top" />
              <div className="goal goal-bottom" />
            </div>
            <span className="ball">⚽</span>
            <span className="field-caption">
              EL JUEGO SE VIVE. TAMBIÉN SE EXPLORA.
            </span>
          </div>
        </section>
      )}
      <section className="section">
        <div className="section-title">
          <h2>{q ? "Resultados de búsqueda" : "¿Por dónde empezamos?"}</h2>
          <span>
            {result.status === "success"
              ? `${result.data.length} equipos encontrados`
              : "TU PRÓXIMO DESCUBRIMIENTO"}
          </span>
        </div>
        {q.length > 0 && q.length < 3 ? (
          <div className="notice">
            Escribe al menos 3 caracteres para buscar un equipo.
          </div>
        ) : (
          <QueryState
            query={result}
            empty="No encontramos equipos con ese nombre."
          />
        )}
        {result.status === "success" && (
          <div className="team-grid">
            {result.data.map(({ team }) => (
              <Link to={`/team/${team.id}`} className="team-card" key={team.id}>
                <Media src={team.logo} alt={`Escudo de ${team.name}`} />
                <div>
                  <h3>{team.name}</h3>
                  {team.country && <p>{team.country}</p>}
                  {team.founded && <small>Desde {team.founded}</small>}
                </div>
                <span className="card-arrow">↗</span>
              </Link>
            ))}
          </div>
        )}
        {!q && (
          <>
            <div className="explore-grid">
              {[
                [
                  "team",
                  "Encuentra tu equipo",
                  "Busca por nombre y descubre su identidad.",
                  "/teams",
                ],
                [
                  "stadium",
                  "Conoce su casa",
                  "Explora los estadios que dan vida al juego.",
                  "/teams",
                ],
                [
                  "league",
                  "Sigue la competición",
                  "Descubre las ligas de cada club.",
                  "/leagues",
                ],
              ].map(([icon, title, copy, to], i) => (
                <Link to={to} className="explore-card" key={title}>
                  <div className="explore-top">
                    <Icon name={icon} />
                    <span>0{i + 1}</span>
                  </div>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                  <span className="card-arrow">↗</span>
                </Link>
              ))}
            </div>
            <div className="search-hint">
              <Icon name="search" />
              <div>
                <strong>Tu equipo está a una búsqueda.</strong>
                <p>
                  Prueba con “Real Madrid”, “Manchester” o el nombre de tu club
                  local.
                </p>
              </div>
            </div>
          </>
        )}
      </section>
    </>
  );
}
