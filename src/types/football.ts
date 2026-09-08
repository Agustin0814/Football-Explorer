export interface Team {
  id: number;
  name: string;
  code?: string | null;
  country?: string | null;
  founded?: number | null;
  national?: boolean;
  logo?: string | null;
}
export interface Venue {
  id?: number | null;
  name?: string | null;
  address?: string | null;
  city?: string | null;
  capacity?: number | null;
  surface?: string | null;
  image?: string | null;
}
export interface SearchResult {
  team: Team;
  venue?: Venue | null;
}
export interface League {
  league: {
    id: number;
    name: string;
    type?: string | null;
    logo?: string | null;
  };
  country?: {
    name?: string | null;
    code?: string | null;
    flag?: string | null;
  };
  seasons?: { year: number; start?: string; end?: string; current?: boolean }[];
}
export interface Fixture {
  fixture: {
    id: number;
    date?: string | null;
    venue?: Venue | null;
    status?: { short?: string; long?: string };
  };
  league: { id: number; name?: string; logo?: string };
  teams: { home: Team; away: Team };
  goals?: { home: number | null; away: number | null };
}
export interface ApiResponse<T> {
  response: T[];
  results: number;
  errors?: Record<string, string> | string[];
}
export interface ErrorResponse {
  error: { code: string; message: string };
}
