import express from "express";
import path from "node:path";
import { ApiError, createFootballClient } from "./proxy.js";
export function createApp(client = createFootballClient()) {
  const app = express();
  app.disable("x-powered-by");
  app.get("/api/health", (_req, res) => {
    res.json({
      ok: true,
      configured: Boolean(process.env.API_FOOTBALL_KEY?.trim()),
    });
  });
  app.get("/api/:resource", async (req, res) => {
    res.setHeader("Cache-Control", "no-store");
    try {
      res.json(await client(req.params.resource, req.query));
    } catch (error) {
      const e =
        error instanceof ApiError
          ? error
          : new ApiError(500, "INTERNAL", "No se pudo completar la consulta.");
      res
        .status(e.status)
        .json({ error: { code: e.code, message: e.message } });
    }
  });
  app.use("/api", (_req, res) => {
    res
      .status(404)
      .json({
        error: { code: "NOT_FOUND", message: "Endpoint no disponible." },
      });
  });
  app.use(express.static(path.resolve("dist")));
  app.get("/{*path}", (_req, res) => {
    res.sendFile(path.resolve("dist/index.html"));
  });
  return app;
}
