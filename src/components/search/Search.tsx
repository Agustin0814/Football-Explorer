import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Icon } from "../common/Media";
export function Search() {
  const location = useLocation();
  const navigate = useNavigate();
  const initial = new URLSearchParams(location.search).get("q") || "";
  const [value, setValue] = useState(initial);
  useEffect(() => {
    setValue(new URLSearchParams(location.search).get("q") || "");
  }, [location.search]);
  useEffect(() => {
    if (value === initial) return;
    const timer = setTimeout(
      () =>
        navigate(
          `/teams${value.trim() ? `?q=${encodeURIComponent(value.trim())}` : ""}`,
          { replace: location.pathname === "/teams" },
        ),
      500,
    );
    return () => clearTimeout(timer);
  }, [value, initial, navigate, location.pathname]);
  return (
    <form
      className="search"
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        navigate(`/teams?q=${encodeURIComponent(value.trim())}`);
      }}
    >
      <Icon name="search" />
      <label htmlFor="team-search" className="sr-only">
        Buscar equipo
      </label>
      <input
        id="team-search"
        placeholder="Buscar equipo..."
        value={value}
        maxLength={80}
        autoComplete="off"
        onChange={(e) => setValue(e.target.value)}
      />
      {value && (
        <button
          type="button"
          aria-label="Limpiar búsqueda"
          onClick={() => setValue("")}
        >
          ×
        </button>
      )}
      <kbd>3+ letras</kbd>
    </form>
  );
}
