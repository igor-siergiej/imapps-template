# __APP_TITLE__

Bun monorepo. Hono API + Vite/React web + shared Zod types. Scaffolded from `imapps-template`.

## Packages
- `packages/types` — Zod schemas + types (`@__APP_NAME__/types`), imported raw, no build.
- `packages/api` — Hono on `Bun.serve`. Layers: `config/` → `dependencies/` (DI container) → `routes/` → `interfaces/` (handlers) → `domain/` (services + repository interfaces) → `infrastructure/` (Mongo, generators).
- `packages/web` — Vite + React. Dev server proxies `/api` to the API on `:3001`.

## Conventions
- DI via `@imapps/api-utils` `DependencyContainer`; register in `dependencies/index.ts`, resolve by `DependencyToken`.
- App bootstrap uses `createApp` from `@imapps/api-utils/hono` (cors + request logging + error handling).
- Repositories implement domain interfaces; services hold business logic; handlers stay thin (parse, call service, return `c.json`).
- Conventional Commits enforced by commitlint. Releases via semantic-release.
- Lint/format: Biome (`bun run lint`, `bun run lint:fix`). Dead code: `bun run audit` (Fallow).

## Commands
- `bun run start` — api + web. `bun run start:api` / `start:web` individually.
- `bun run --filter @__APP_NAME__/api test` — Bun test. `--filter @__APP_NAME__/web test` — Vitest.
- `bun run build` — build all packages.

## Adding a feature
1. Add/extend a Zod schema in `packages/types`.
2. Repository interface in `domain/`, Mongo impl in `infrastructure/`.
3. Service in `domain/`, register both in `dependencies/index.ts` + `dependencies/types.ts`.
4. Handlers in `interfaces/`, wire routes in `routes/index.ts`.
5. Consume from `packages/web`.
