import { Link } from "react-router-dom";
export function NotFoundPage({
  title = "Esta página está fuera de juego.",
  upcoming = false,
}: {
  title?: string;
  upcoming?: boolean;
}) {
  return (
    <section className="panel league-intro">
      <div className="eyebrow">{upcoming ? "PRÓXIMAMENTE" : "404"}</div>
      <h1>{title}</h1>
      <p>
        {upcoming
          ? "Este espacio está preparado para una próxima versión. Por ahora, explora clubes, sus competiciones y partidos desde la ficha de cada equipo."
          : "La página que buscas no existe."}
      </p>
      <Link to="/teams" className="primary-button">
        Explorar equipos ↗
      </Link>
    </section>
  );
}
