# __APP_TITLE__

Bun monorepo. Hono API + Vite+/React web + shared Zod types. Scaffolded from `imapps-template`.

## Packages
- `packages/types` — Zod schemas + types (`@__APP_NAME__/types`), imported raw, no build.
- `packages/api` — Hono on `Bun.serve`. Layers: `config/` → `dependencies/` (DI container) → `routes/` → `interfaces/` (handlers) → `domain/` (services + repository interfaces) → `infrastructure/` (Mongo, generators).
- `packages/web` — Vite+ (`vp dev` / `vp build` / `vp test`) + React. Dev server proxies `/api` to the API on `:3001`. Vite and Vitest config both live in `packages/web/vite.config.ts`; import test helpers from `vite-plus/test`, not `vitest`.

## Conventions
- DI via `@imapps/api-utils` `DependencyContainer`; register in `dependencies/index.ts`, resolve by `DependencyToken`.
- App bootstrap uses `createApp` from `@imapps/api-utils/hono` (cors + request logging + error handling).
- Repositories implement domain interfaces; services hold business logic; handlers stay thin (parse, call service, return `c.json`).
- Conventional Commits enforced by commitlint. Releases via semantic-release.
- Toolchain: Vite+ (`vite-plus`). Lint (Oxlint + vendored anti-slop rules) and format (Oxfmt) use the shared `@imapps/oxc-config` presets, wired in the root `vite.config.ts` (`lint`, `fmt`, `staged` blocks). Keep repo-specific tweaks there, not in nested configs.
- `bun run lint` = `vp check`: format check + lint + type check (type-aware, tsgo) for every package. `bun run lint:fix` before finishing. Fix anti-slop findings (parse at the boundary with zod, keep types precise, `// SAFETY:` before unavoidable assertions), never suppress them.
- Hooks: Vite+ (`.vite-hooks/`, installed by `prepare` → `vp config`). `pre-commit` → `vp staged`, `commit-msg` → commitlint.
- Dead code: `bun run audit` (Fallow).

## Commands
- `bun run start` — api + web. `bun run start:api` / `start:web` individually.
- `bun run test` — all packages. `bun run --filter @__APP_NAME__/api test` — Bun test. `--filter @__APP_NAME__/web test` — Vitest via `vp test`.
- `bun run build` — build all packages (API → single bundle in `packages/api/build/index.js`, web → `packages/web/build`).
- `bun run lint` / `bun run lint:fix` / `bun run format` — `vp check` / `vp check --fix` / `vp fmt`.

## Adding a feature
1. Add/extend a Zod schema in `packages/types`.
2. Repository interface in `domain/`, Mongo impl in `infrastructure/`.
3. Service in `domain/`, register both in `dependencies/index.ts` + `dependencies/types.ts`.
4. Handlers in `interfaces/`, wire routes in `routes/index.ts`.
5. Consume from `packages/web`.
