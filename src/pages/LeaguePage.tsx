import { Link, useParams } from "react-router-dom";
import { useFootball } from "../hooks/useFootball";
import type { League } from "../types/football";
import { QueryState } from "../components/common/QueryState";
import { Media } from "../components/common/Media";
export function LeaguePage() {
  const { id } = useParams();
  const valid = id && /^[1-9]\d{0,8}$/.test(id);
  const query = useFootball<League>(valid ? `leagues?id=${id}` : null);
  const item = query.data[0];
  if (!id)
    return (
      <>
        <div className="eyebrow">LAS COMPETICIONES DEL JUEGO</div>
        <h1>Un club. Muchos caminos.</h1>
        <p className="intro">
          Descubre las ligas y copas desde la ficha de un equipo.
        </p>
        <section className="panel league-intro">
          <Media kind="team" alt="Competición" />
          <h2>La competición empieza por tu equipo.</h2>
          <p>
            Busca un club y abre una de sus competiciones actuales para conocer
            su país, tipo y temporadas disponibles.
          </p>
          <Link className="primary-button" to="/teams">
            Buscar un equipo ↗
          </Link>
        </section>
      </>
    );
  if (!valid)
    return (
      <div className="notice">El identificador de la liga no es válido.</div>
    );
  return (
    <>
      <Link className="back-link" to="/leagues">
        ← Explorar ligas
      </Link>
      <QueryState query={query} empty="No encontramos esta competición." />
      {item && (
        <section className="panel league-detail">
          <Media src={item.league.logo} alt={item.league.name} />
          <div className="eyebrow">FICHA DE LA COMPETICIÓN</div>
          <h1>{item.league.name}</h1>
          <dl className="facts">
            {item.country?.name && (
              <div>
                <dt>País</dt>
                <dd>{item.country.name}</dd>
              </div>
            )}
            {item.league.type && (
              <div>
                <dt>Tipo</dt>
                <dd>{item.league.type}</dd>
              </div>
            )}
          </dl>
          <h2>Temporadas disponibles</h2>
          {item.seasons?.length ? (
            <div className="seasons">
              {[...item.seasons]
                .sort((a, b) => b.year - a.year)
                .map((s) => (
                  <span className="season" key={s.year}>
                    {s.year}
                    {s.current && <b>Actual</b>}
                  </span>
                ))}
            </div>
          ) : (
            <p>No hay temporadas disponibles.</p>
          )}
        </section>
      )}
    </>
  );
}
