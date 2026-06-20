# imapps-template

Scaffold for IM Apps: a Bun monorepo with a Hono API, a Vite + React web app, and shared `@imapps/*` tooling.

## Create a new app

```bash
bunx degit igor-siergiej/imapps-template my-app
cd my-app
bun run init my-app          # replaces __APP_NAME__/__APP_TITLE__ tokens, removes itself
bun install
git init && git add -A && git commit -m "chore: scaffold from imapps-template"
```

`bun run init <name>` takes a kebab-case slug. The display title is derived from it (`my-app` → `My App`).

## Stack

| Concern | Choice |
|---------|--------|
| Runtime / package manager | Bun (`workspaces: packages/*`) |
| API | Hono on `Bun.serve`, `@imapps/api-utils` (DI container, Mongo, Logger, `createApp`) |
| Web | Vite 7 + React 19 |
| Shared types | `packages/types` (Zod), consumed raw |
| Lint / format | Biome |
| Hooks | Husky + lint-staged + commitlint (Conventional Commits) |
| Release | semantic-release |
| Dead code | Fallow |
| CI | GitHub Actions (`.github/workflows`), shared scripts via `workflows-utils` submodule |
| Containers | `Dockerfile.api`, `Dockerfile.web` |

## Layout

```
packages/
  types/   Zod schemas + shared TS types (example: Item)
  api/     Hono API — config, DI, routes, interfaces (handlers), domain, infrastructure
  web/     Vite + React app (example: Item list)
```

The example `Item` entity wires one feature end-to-end (type → repository → service → handler → route → UI). Strip it out and build your own.

## Commands

```bash
bun run start          # api + web together (reads .env)
bun run start:api      # api only  (port 3001)
bun run start:web      # web only  (port 3000, proxies /api -> 3001)
bun run lint           # biome check
bun run build          # build all packages
bun run --filter @my-app/api test
bun run --filter @my-app/web test
```

## Post-scaffold setup

1. Create the GitHub repo `igor-siergiej/my-app` and push.
2. `git submodule add https://github.com/igor-siergiej/utils .github/workflows-utils` (already declared in `.gitmodules`; run `git submodule update --init` after cloning).
3. Add repo secrets — see `utils/GITHUB_SECRETS_SETUP.md` (Docker, Cloudflare Access, deploy URLs).
4. Copy `.env.example` to `.env` and fill in Mongo connection details.
