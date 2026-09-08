import { useEffect, useState } from "react";
import { footballApi } from "../services/footballApi";
export type Query<T> = {
  status: "idle" | "loading" | "success" | "empty" | "error";
  data: T[];
  error?: string;
  retry: () => void;
};
export function useFootball<T>(path: string | null): Query<T> {
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<{
    path: string | null;
    status: Query<T>["status"];
    data: T[];
    error?: string;
  }>({ path: null, status: "idle", data: [] });
  useEffect(() => {
    if (!path) return;
    let current = true;
    setState({ path, status: "loading", data: [] });
    footballApi<T>(path)
      .then((data) => {
        if (current)
          setState({ path, status: data.length ? "success" : "empty", data });
      })
      .catch((e: Error) => {
        if (current)
          setState({ path, status: "error", data: [], error: e.message });
      });
    return () => {
      current = false;
    };
  }, [path, revision]);
  return {
    ...(path && state.path === path
      ? state
      : { status: path ? "loading" : "idle", data: [] }),
    retry: () => setRevision((r) => r + 1),
  };
}
