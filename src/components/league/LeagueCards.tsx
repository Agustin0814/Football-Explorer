import { Link } from "react-router-dom";
import type { League } from "../../types/football";
import { Media } from "../common/Media";
export function LeagueCards({ leagues }: { leagues: League[] }) {
  return (
    <div className="league-list">
      {leagues.map((item) => (
        <Link
          className="league-card"
          key={item.league.id}
          to={`/league/${item.league.id}`}
        >
          <Media src={item.league.logo} alt={item.league.name} />
          <div>
            <h3>{item.league.name}</h3>
            <p>
              {[item.country?.name, item.league.type]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
          <span>↗</span>
        </Link>
      ))}
    </div>
  );
}
