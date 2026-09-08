import { test, expect } from "@playwright/test";

// Respuestas sintéticas exclusivas de pruebas; nunca se importan en la aplicación.
const team = {
  id: 42,
  name: "Club de prueba",
  country: "País de prueba",
  founded: 1900,
  logo: "https://images.example.invalid/team.png",
};
const league = {
  league: { id: 39, name: "Liga de prueba", type: "League", logo: null },
  country: { name: "País de prueba" },
  seasons: [{ year: 2026, current: true }],
};
test("búsqueda, fichas, caché, imágenes ausentes y navegación móvil", async ({
  page,
}) => {
  const requests: string[] = [];
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/assets/images/**", (route) =>
    route.fulfill({ status: 404, body: "" }),
  );
  await page.route("**/assets/icons/**", (route) =>
    route.fulfill({ status: 404, body: "" }),
  );
  await page.route("https://images.example.invalid/**", (route) =>
    route.abort(),
  );
  await page.route("**/api/**", async (route) => {
    const url = new URL(route.request().url());
    requests.push(url.pathname + url.search);
    let response: unknown[] = [];
    if (url.pathname === "/api/teams")
      response = [
        {
          team,
          venue: {
            name: "Estadio de prueba",
            city: "Ciudad de prueba",
            capacity: 12345,
            image: null,
          },
        },
        ...(url.searchParams.has("search")
          ? [{ team: { id: 43, name: "Otro club de prueba" } }]
          : []),
      ];
    if (url.pathname === "/api/leagues") response = [league];
    if (url.pathname === "/api/fixtures")
      response = [
        {
          fixture: {
            id: url.searchParams.has("next") ? 1 : 2,
            date: "2026-09-08T20:00:00Z",
            venue: { name: "Estadio de prueba" },
            status: { long: "Estado de prueba" },
          },
          league: league.league,
          teams: { home: team, away: { id: 43, name: "Visitante de prueba" } },
          goals: { home: 0, away: 2 },
        },
      ];
    await route.fulfill({ json: { response, results: response.length } });
  });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Cada escudo tiene una historia." }),
  ).toBeVisible();
  await page.screenshot({
    path: "test-results/home-desktop.png",
    fullPage: true,
  });
  const input = page.getByRole("textbox", { name: "Buscar equipo" });
  await input.fill("Cl");
  await page.waitForTimeout(650);
  expect(requests).toHaveLength(0);
  await input.fill("Club");
  await page.waitForTimeout(200);
  expect(requests).toHaveLength(0);
  await expect(
    page.getByRole("heading", { name: "Club de prueba", exact: true }),
  ).toBeVisible();
  expect(requests).toHaveLength(1);
  await page
    .getByRole("link")
    .filter({
      has: page.getByRole("heading", { name: "Club de prueba", exact: true }),
    })
    .click();
  await expect(page).toHaveURL(/\/team\/42$/);
  await expect(
    page.getByRole("heading", { name: "Competiciones actuales" }),
  ).toBeVisible();
  await expect(page.getByText("0 : 2", { exact: true })).toBeVisible();
  await expect(page.getByText("12.345", { exact: true })).toBeVisible();
  await expect(page.locator(".hero-background .media-fallback")).toBeVisible();
  await expect(
    page.locator(".team-hero-content .media-fallback"),
  ).toBeVisible();
  expect(requests).toHaveLength(5);
  await page.screenshot({
    path: "test-results/team-desktop.png",
    fullPage: true,
  });
  await page.locator(".league-card").click();
  await expect(page).toHaveURL(/\/league\/39$/);
  await expect(page.getByText("2026Actual")).toBeVisible();
  await page.goBack();
  await expect(
    page.getByRole("heading", { name: "Club de prueba", exact: true }),
  ).toBeVisible();
  expect(requests).toHaveLength(6);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/team-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Abrir menú" }).click();
  await page.getByRole("link", { name: "Ligas", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Un club. Muchos caminos." }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("vacío, cuota, reintento y recuperación sin bloquear la interfaz", async ({
  page,
}) => {
  let attempt = 0;
  await page.route("**/api/teams?*", async (route) => {
    attempt++;
    if (attempt === 1)
      return route.fulfill({
        status: 429,
        json: {
          error: {
            code: "QUOTA",
            message:
              "Se alcanzó temporalmente el límite de consultas de la API.",
          },
        },
      });
    await route.fulfill({ json: { response: [], results: 0 } });
  });
  await page.goto("/teams?q=Desconocido");
  await expect(page.getByRole("alert")).toContainText("límite de consultas");
  await page.getByRole("button", { name: "Reintentar" }).click();
  await expect(
    page.getByText("No encontramos equipos con ese nombre."),
  ).toBeVisible();
  await page.getByRole("link", { name: "Inicio", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Cada escudo tiene una historia." }),
  ).toBeVisible();
});

test("datos incompletos y error parcial conservan la ficha", async ({
  page,
}) => {
  await page.route("**/api/**", async (route) => {
    if (new URL(route.request().url()).pathname === "/api/teams")
      return route.fulfill({
        json: {
          response: [{ team: { id: 42, name: "Club mínimo" }, venue: null }],
          results: 1,
        },
      });
    await route.fulfill({
      status: 502,
      json: {
        error: {
          code: "NETWORK",
          message: "No pudimos conectar con API-Football.",
        },
      },
    });
  });
  await page.goto("/team/42");
  await expect(
    page.getByRole("heading", { name: "Club mínimo" }),
  ).toBeVisible();
  await expect(page.getByRole("alert")).toHaveCount(3);
  await expect(page.locator("main")).not.toContainText(/undefined|null/);
  await expect(
    page.getByText("El proveedor no ha incluido información del estadio."),
  ).toBeVisible();
});

test("servidor real informa que falta la configuración", async ({
  page,
  request,
}) => {
  const health = await request.get("/api/health");
  test.skip(
    (await health.json()).configured,
    "La cuenta ya está configurada; no gastar cuota en esta prueba.",
  );
  await page.goto("/teams?q=Real%20Madrid");
  await expect(page.getByRole("alert")).toContainText("API_FOOTBALL_KEY");
});
