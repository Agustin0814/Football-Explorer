import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { HomePage } from "./pages/HomePage";
import { TeamPage } from "./pages/TeamPage";
import { LeaguePage } from "./pages/LeaguePage";
import { NotFoundPage } from "./pages/NotFoundPage";
export default function App() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="teams" element={<HomePage />} />
        <Route path="team/:id" element={<TeamPage key={pathname} />} />
        <Route path="leagues" element={<LeaguePage />} />
        <Route path="league/:id" element={<LeaguePage />} />
        {[
          ["players", "Jugadores"],
          ["matches", "Partidos"],
          ["favorites", "Favoritos"],
        ].map(([path, title]) => (
          <Route
            key={path}
            path={path}
            element={<NotFoundPage upcoming title={title} />}
          />
        ))}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
