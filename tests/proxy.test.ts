import { test } from "node:test";
import assert from "node:assert/strict";
import { ApiError, createFootballClient, queryFor } from "../server/proxy.js";
test("solo acepta endpoints y parámetros del MVP", () => {
  for (const [resource, query] of [
    ["teams", { search: "ab" }],
    ["teams", { id: "0" }],
    ["teams", { search: "Madrid", url: "https://example.com" }],
    ["fixtures", { team: "42", next: "100" }],
    ["odds", {}],
  ] as [string, Record<string, string>][])
    assert.throws(() => queryFor(resource, query), ApiError);
  assert.equal(
    queryFor("leagues", { team: "42", current: "true" }).path,
    "leagues?current=true&team=42",
  );
});
test("mantiene la clave en el header, elimina metadatos y deduplica peticiones", async () => {
  let calls = 0;
  const client = createFootballClient(
    async (url, options) => {
      calls++;
      assert.equal(url, "https://v3.football.api-sports.io/teams?id=42");
      assert.equal(
        (options?.headers as Record<string, string>)["x-apisports-key"],
        "test-secret",
      );
      await new Promise((resolve) => setTimeout(resolve, 20));
      return Response.json({
        response: [{ team: { id: 42 } }],
        errors: [],
        parameters: { secret: "not-forwarded" },
      });
    },
    () => "test-secret",
  );
  const [first, second] = await Promise.all([
    client("teams", { id: "42" }),
    client("teams", { id: "42" }),
  ]);
  assert.deepEqual(first, second);
  await client("teams", { id: "42" });
  assert.equal(calls, 1);
  assert.deepEqual(Object.keys(first).sort(), ["response", "results"]);
});
test("sin configuración no hace llamadas externas", async () => {
  const client = createFootballClient(
    async () => {
      throw new Error("no debe llamarse");
    },
    () => undefined,
  );
  await assert.rejects(
    client("teams", { id: "42" }),
    (e: ApiError) => e.code === "NOT_CONFIGURED",
  );
});
test("detecta límites incluso en HTTP 200 y no almacena errores", async () => {
  let calls = 0;
  const client = createFootballClient(
    async () => {
      calls++;
      return Response.json({
        errors: { requests: "You have reached the request limit" },
        response: [],
      });
    },
    () => "test",
  );
  for (let i = 0; i < 2; i++)
    await assert.rejects(
      client("teams", { id: "42" }),
      (e: ApiError) => e.code === "QUOTA" && e.status === 429,
    );
  assert.equal(calls, 2);
});
test("distingue plan, red y respuesta inválida", async () => {
  const scenarios: [typeof fetch, string][] = [
    [
      async () =>
        Response.json({
          errors: { plan: "Season not available for your plan" },
          response: [],
        }),
      "PLAN",
    ],
    [
      async () => {
        throw new Error("offline");
      },
      "NETWORK",
    ],
    [async () => new Response("invalid"), "INVALID_RESPONSE"],
    [async () => Response.json({ response: null }), "INVALID_RESPONSE"],
    [async () => new Response("", { status: 429 }), "QUOTA"],
  ];
  for (const [fetcher, code] of scenarios)
    await assert.rejects(
      createFootballClient(fetcher, () => "test")("teams", { id: "42" }),
      (e: ApiError) => e.code === code,
    );
});
