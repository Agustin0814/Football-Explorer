import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Icon, Media } from "../common/Media";
import { Search } from "../search/Search";
const links = [
  ["/", "home", "Inicio"],
  ["/teams", "team", "Equipos"],
  ["/leagues", "league", "Ligas"],
  ["/players", "player", "Jugadores"],
  ["/matches", "match", "Partidos"],
  ["/favorites", "favorite", "Favoritos"],
];
export function Layout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="app-shell">
      <a className="skip" href="#main">
        Saltar al contenido
      </a>
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <NavLink to="/" className="brand" onClick={() => setOpen(false)}>
          <Media kind="logo" alt="" />
          <span>
            Football
            <strong>
              Explorer<span className="green-dot">.</span>
            </strong>
          </span>
        </NavLink>
        <span className="nav-label">EXPLORA EL JUEGO</span>
        <nav aria-label="Navegación principal">
          {links.map(([to, icon, label], i) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={() => setOpen(false)}
            >
              <Icon name={icon} />
              {label}
              {i > 2 && <span className="soon-dot" title="Próximamente" />}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <span className="live-dot" /> El fútbol, más cerca.
          <p>
            Una nueva forma de descubrir
            <br />
            el deporte que nos une.
          </p>
          <small>FOOTBALL EXPLORER © {new Date().getFullYear()}</small>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <button
            className="menu-button"
            aria-label="Abrir menú"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            ☰
          </button>
          <Search />
          <span className="provider">
            <span className="live-dot" /> Datos de API-Football
          </span>
        </header>
        <main id="main" tabIndex={-1}>
          <Outlet />
        </main>
        <footer>
          Hecho para explorar el fútbol.
          <span>Datos sujetos a la cobertura de API-Football</span>
        </footer>
      </div>
    </div>
  );
}
