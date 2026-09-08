import { Link } from "react-router-dom";
import { useFootball } from "../../hooks/useFootball";
import type { Fixture } from "../../types/football";
import { Media } from "../common/Media";
import { QueryState } from "../common/QueryState";
export function FixtureList({
  teamId,
  recent = false,
}: {
  teamId: string;
  recent?: boolean;
}) {
  const query = useFootball<Fixture>(
    `fixtures?team=${teamId}&${recent ? "last" : "next"}=5`,
  );
  return (
    <section className="panel">
      <div className="section-title">
        <h2>{recent ? "Resultados recientes" : "Próximos partidos"}</h2>
        <span>HASTA 5</span>
      </div>
      <QueryState
        query={query}
        empty={
          recent
            ? "No hay resultados recientes disponibles."
            : "No hay próximos partidos disponibles."
        }
      />
      <div className="fixtures">
        {query.data.slice(0, 5).map((item) => {
          const date = item.fixture.date ? new Date(item.fixture.date) : null;
          const valid = date && !Number.isNaN(date.getTime());
          return (
            <article className="fixture" key={item.fixture.id}>
              <div className="fixture-meta">
                <Link to={`/league/${item.league.id}`}>
                  {item.league.name || "Competición"}
                </Link>
                {valid && (
                  <time dateTime={item.fixture.date!}>
                    {date.toLocaleDateString("es", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </time>
                )}
              </div>
              <div className="fixture-teams">
                <Link to={`/team/${item.teams.home.id}`}>
                  <Media src={item.teams.home.logo} alt="" />
                  {item.teams.home.name}
                </Link>
                <strong className="score">
                  {recent
                    ? `${item.goals?.home ?? "–"} : ${item.goals?.away ?? "–"}`
                    : valid
                      ? date.toLocaleTimeString("es", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Por confirmar"}
                </strong>
                <Link to={`/team/${item.teams.away.id}`}>
                  <Media src={item.teams.away.logo} alt="" />
                  {item.teams.away.name}
                </Link>
              </div>
              <small>
                {[item.fixture.status?.long, item.fixture.venue?.name]
                  .filter(Boolean)
                  .join(" · ")}
              </small>
            </article>
          );
        })}
      </div>
      {!recent && (
        <p className="footnote">
          Horarios en tu zona local:{" "}
          {Intl.DateTimeFormat().resolvedOptions().timeZone}.
        </p>
      )}
    </section>
  );
}
