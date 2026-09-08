# Football Explorer

Una aplicación web para buscar y explorar información futbolística de manera visual, rápida y sencilla. Construida desde cero con React, TypeScript y un proxy Node.js que mantiene la clave de API-Football fuera del navegador.

## Características

- Búsqueda de equipos por nombre, desde 3 caracteres y con debounce de 500 ms.
- Resultados individuales y navegación por IDs reales: `/team/:id` y `/league/:id`.
- Ficha del club, escudo, país, fundación e información disponible del estadio.
- Competiciones actuales, ficha de liga y temporadas suministradas por la API.
- Hasta 5 próximos partidos y 5 resultados recientes, con horarios locales.
- Estados de carga, ausencia de datos, red, cuota, configuración y restricciones del plan. Reintentos por sección.
- Caché en memoria y deduplicación de consultas simultáneas en cliente y servidor.
- Interfaz responsive, navegación móvil, foco visible, etiquetas accesibles y movimiento reducido.
- Fallbacks encadenados para imágenes e iconos ausentes.

Jugadores, el índice global de partidos y favoritos están identificados como espacios para una próxima versión. Los partidos de un equipo sí están disponibles dentro de su ficha. La sección Ligas explica cómo descubrir competiciones a través de un equipo; no descarga un catálogo completo ni consume cuota al abrirla.

## Capturas

Espacio preparado para capturas de inicio, búsqueda, ficha del club y versión móvil. Puedes guardarlas en `docs/screenshots/` y enlazarlas aquí después de configurar tu cuenta. La aplicación no incluye datos deportivos de demostración.

## Stack y requisitos

React 19, TypeScript, Vite, CSS, React Router, Node.js, Express, tsx y ESLint. Sin base de datos, autenticación ni servicios adicionales de persistencia.

- Node.js 22.12 o superior y npm.
- Una cuenta de [API-Football](https://dashboard.api-football.com/) para obtener tu clave. El [plan gratuito](https://www.api-football.com/pricing) no requiere tarjeta y publica 100 solicitudes por día; las temporadas disponibles están limitadas. Condiciones verificadas el 8 de septiembre de 2026; revisa el panel de tu cuenta para conocer su cobertura vigente.

## Instalación

Desde esta carpeta:

```bash
npm install
```

Copia `.env.example` a `.env` (PowerShell):

```powershell
Copy-Item .env.example .env
```

En macOS/Linux: `cp .env.example .env`.

Edita `.env` localmente:

```dotenv
API_FOOTBALL_KEY=tu_clave_personal
PORT=3001
```

El ejemplo del repositorio no contiene una clave real. No compartas `.env`.

```bash
npm run dev
```

Abre `http://localhost:5173`. Este comando inicia Vite y el proxy en `http://localhost:3001`. Vite redirige `/api` al proxy sin CORS. Si cambias el puerto del servidor en desarrollo, actualiza también el destino del proxy en `vite.config.ts`. Reinicia el servidor cuando cambies `.env`.

Sin clave puedes explorar la interfaz. Al buscar, aparece un mensaje de configuración y un botón para reintentar. No se realizan llamadas al proveedor sin una clave.

## Build y validación

```bash
npm run lint
npm test
npm run build
npm start
```

`build` comprueba TypeScript y genera `dist/` (frontend) y `dist-server/` (backend). `start`, ejecutado desde la raíz del proyecto, sirve ambos en el mismo origen, por defecto `http://localhost:3001`. El servidor incluye fallback de navegación para abrir y recargar rutas como `/team/42`.

Las pruebas del proxy usan respuestas controladas y nunca gastan cuota ni requieren tu clave. Comprueban validación de consultas, secreto en el header, caché, deduplicación y errores del proveedor. No sustituyen una comprobación contra una cuenta real.

Para repetir las pruebas de navegador:

```bash
npx playwright install chromium
npm run test:e2e
```

Playwright inicia el entorno local si hace falta. Comprueba búsqueda con debounce, navegación por IDs, caché, marcador cero, imágenes ausentes, vista móvil, errores parciales y reintentos. Las respuestas deportivas son sintéticas y están exclusivamente en `tests/browser.spec.ts`; no forman parte del bundle. La prueba del servidor sin clave se omite si ya configuraste tu cuenta. Las capturas de validación se generan en `test-results/`, ignorado por Git.

## Arquitectura

```text
Navegador React → GET /api/... → Express → API-Football v3
                                  └── x-apisports-key (solo servidor)
```

```text
football-explorer/
├── public/assets/{images,icons}/
├── src/
│   ├── components/{common,layout,search,league,fixtures}/
│   ├── hooks/useFootball.ts
│   ├── pages/
│   ├── services/footballApi.ts
│   ├── styles/global.css
│   ├── types/football.ts
│   ├── App.tsx
│   └── main.tsx
├── server/
│   ├── app.ts
│   ├── index.ts
│   └── proxy.ts
├── tests/proxy.test.ts
├── .env.example
└── vite.config.ts
```

`Team` y `Venue` son modelos independientes; un comparador futuro puede reutilizar la consulta por ID sin cambiar la capa de API.

## API y cuota

Proveedor: [API-Football v3](https://www.api-football.com/documentation-v3), base `https://v3.football.api-sports.io/`.

| Ruta del proxy | Consulta al proveedor |
| --- | --- |
| `/api/teams?search=Real%20Madrid` | `/teams?search=Real%20Madrid` |
| `/api/teams?id=42` | `/teams?id=42` |
| `/api/leagues?team=42&current=true` | `/leagues?team=42&current=true` |
| `/api/leagues?id=39` | `/leagues?id=39` |
| `/api/fixtures?team=42&next=5` | `/fixtures?team=42&next=5` |
| `/api/fixtures?team=42&last=5` | `/fixtures?team=42&last=5` |

`/api/health` comprueba el servidor y si tiene una clave configurada; no valida esa clave ni consulta al proveedor. Los demás endpoints y parámetros se rechazan.

La búsqueda espera 500 ms tras escribir. No consulta con menos de 3 caracteres. Las respuestas exitosas, incluidas las vacías, se guardan durante 6 horas para equipos y ligas, y 10 minutos para partidos. El servidor limita la caché a 500 entradas; las consultas simultáneas idénticas comparten una petición. Los errores no se almacenan y no hay reintentos automáticos ni polling.

Una búsqueda nueva consume normalmente 1 solicitud; abrir un equipo no almacenado consume 4; abrir una liga nueva consume 1. Consultar distintas búsquedas tras pausas prolongadas sí consume solicitudes. La caché del navegador se pierde al recargar; la del servidor sigue evitando llamadas hasta que vence o se reinicia el proceso. No existe persistencia entre instancias del servidor.

La cuenta gratuita puede restringir temporadas y filtros de partidos. Si rechaza `current`, `next` o `last`, se muestra el mensaje correspondiente y el resto de la ficha permanece disponible. No se inventan calendarios ni se cambian silenciosamente por temporadas antiguas. Los horarios corresponden a la zona del navegador y los resultados reflejan la última respuesta almacenada, no un marcador en vivo.

## Recursos e imágenes

Crea o copia tus recursos con estos nombres exactos; las carpetas ya están incluidas:

```text
public/assets/images/
  logo.png
  team-placeholder.png
  player-placeholder.png
  stadium-placeholder.png

public/assets/icons/
  search.svg       home.svg       team.svg
  league.svg       player.svg     match.svg
  stadium.svg      calendar.svg   country.svg
  back.svg         favorite.svg   history.svg
  error.svg
```

`logo.png` solo es el símbolo; el nombre de la aplicación se escribe con HTML. Los escudos, logos de competiciones e imágenes de estadios provienen del proveedor. Cada imagen remota HTTP(S) tiene manejo de error: primero se prueba el PNG local y, si tampoco existe, se dibuja un fallback de CSS/texto. Los SVG faltantes usan un símbolo de texto. No hay bucles de errores.

Al colocar los archivos en desarrollo basta recargar la página. En producción vuelve a compilar y desplegar para copiarlos a `dist/`. Algunos iconos y el placeholder de jugadores quedan reservados para la ampliación del MVP. Las fuentes de Google Fonts son opcionales: hay fuentes del sistema como alternativa.

## Seguridad

- La clave se lee únicamente en Node desde `API_FOOTBALL_KEY` y se envía al proveedor en `x-apisports-key`.
- Nunca uses un prefijo `VITE_` para secretos. El frontend no importa archivos del servidor.
- `.env` y variantes locales están ignoradas por Git; `.env.example` sí se incluye.
- El proxy acepta únicamente los endpoints y combinaciones de parámetros del MVP. No acepta URLs arbitrarias ni actúa como proxy abierto.
- Las respuestas omiten metadatos del proveedor y los errores públicos no incluyen headers ni secretos. La conexión externa tiene timeout de 12 segundos.
- No hay login ni protección contra uso público de la cuota compartida. Para un despliegue público con tráfico, configura límites de solicitudes en el proveedor de hosting. La caché en memoria no se comparte entre réplicas.

## Despliegue sencillo: servicio Node

La opción más sencilla es un único servicio Node en una plataforma compatible como Render, Railway, Fly.io o un servidor propio. El frontend y el backend se despliegan juntos:

1. Sube el proyecto a tu repositorio GitHub sin `.env`.
2. Configura la raíz del servicio en esta carpeta.
3. Comando de instalación y build: `npm ci && npm run build`.
4. Comando de arranque: `npm start`.
5. Añade `API_FOOTBALL_KEY` en las variables privadas del servicio. Usa el `PORT` que asigne la plataforma.
6. Abre la URL HTTPS del servicio. Verifica la búsqueda y una recarga directa de `/team/42`.

El proceso Node sirve `dist` y `/api`; no necesitas publicar otra aplicación ni configurar CORS. No despliegues únicamente `dist` si quieres que funcione la API.

Para separar frontend y backend, sirve `dist/` en un host estático con fallback a `index.html` y configura una reescritura de `/api/*` hacia el servidor Node por HTTPS. Mantén la clave solo en ese servidor. Esto permite usar un frontend en Vercel, aunque este repositorio prioriza el despliegue Node conjunto y no incluye un adaptador serverless. La configuración local de Vite proxy no se aplica al build de producción.

## Futuras mejoras

Favoritos e historial en localStorage, comparación entre equipos, fotografías de jugadores, más filtros de ligas, accesibilidad ampliada y pruebas de navegador contra una cuenta de integración. Ninguna de estas ampliaciones necesita cambiar la identidad de los equipos basada en IDs.
#   F o o t b a l l - E x p l o r e r  
 