# imapps-template

Scaffold for IM Apps: a Bun monorepo with a Hono API, a Vite + React web app, and shared `@imapps/*` tooling. Every new app on the `imapps.uk` homelab (Dokploy on host `foundry`) starts from here, so it gets the same layering, lint/commit rules, CI, release and image publishing as shoppingo / jewellery-catalogue / kivo.

Architecture and deploy path: [`docs/diagrams/architecture.excalidraw`](docs/diagrams/architecture.excalidraw) (open in excalidraw.com or the VS Code Excalidraw extension).

## Create a new app

```bash
bunx degit igor-siergiej/imapps-template my-app
cd my-app
bun run init my-app          # replaces the __APP_*__ placeholder tokens, removes itself
bun install                  # creates bun.lock — commit it, both Dockerfiles need it
git init && git add -A && git commit -m "chore: scaffold from imapps-template"
```

`bun run init <name>` takes a kebab-case slug (`^[a-z0-9][a-z0-9-]*$`). The display title is derived from it (`my-app` → `My App`).

What `scripts/init.ts` does:

- Walks every text file (skips `node_modules`, `.git`, `build`, `dist`, `.tooling`, `bun.lock`, binaries) and replaces the app-name token with the slug and the app-title token with the title.
- Deletes the `init` script from `package.json` and removes `scripts/`.

That covers: root `package.json` name/repository, workspace package names (`@my-app/api`, `@my-app/web`, `@my-app/types`), imports, the Vite alias, `--filter` targets in both workflows, the `publish-images.sh` service name in `ci-cd.yml`, `Dockerfile.*` build filters, `.env.example` `DATABASE_NAME`, and `CLAUDE.md`.

Not renamed for you:

- This README (it describes the template — replace it with the app's own).
- `allowedOrigins` in `packages/api/src/index.ts` (only `http://localhost:3000`). Not needed in prod while web and API share one hostname (see deploy checklist); add the origin if the web is ever served from a different host.
- The example `Item` entity (types, repository, service, handlers, routes, web list, tests). Strip it once your own feature is in.

## Stack

| Concern | Choice |
|---------|--------|
| Runtime / package manager | Bun (`workspaces: packages/*`) |
| API | Hono on `Bun.serve`, `@imapps/api-utils` (DI container, Mongo, Logger, `createApp`) |
| Web | Vite 7 + React 19 |
| Shared types | `packages/types` (Zod), consumed raw |
| Lint / format | Biome |
| Hooks | Husky: `pre-commit` → lint-staged (`biome check --fix --unsafe`), `commit-msg` → commitlint (Conventional Commits) |
| Release | semantic-release (`.releaserc.json`) |
| Dead code | Fallow (`bun run audit` locally, `fallow-rs/fallow` action on PRs) |
| CI | GitHub Actions (`.github/workflows`), shared scripts via `workflows-utils` submodule |
| Containers | `Dockerfile.api` (Bun, `:3001`), `Dockerfile.web` (Vite build served by nginx, `:3000`) |

## Layout

```
packages/
  types/   Zod schemas + shared TS types (example: Item)
  api/     Hono API — config, DI, routes, interfaces (handlers), domain, infrastructure
  web/     Vite + React app (example: Item list), Playwright e2e in e2e/
```

The example `Item` entity wires one feature end-to-end (type → repository → service → handler → route → UI). Strip it out and build your own. API routes: `GET /api/health` (pings Mongo, 200/500), `GET|POST /api/items`, `GET|DELETE /api/items/:id`.

## Commands

```bash
bun run start          # api + web together (reads .env)
bun run start:api      # api only  (port 3001)
bun run start:web      # web only  (port 3000, proxies /api -> 3001)
bun run lint           # biome check
bun run lint:fix       # biome check --fix --unsafe
bun run build          # build all packages
bun run audit          # fallow dead-code audit
bun run --filter @my-app/api test
bun run --filter @my-app/web test                      # vitest
bun run --cwd packages/web pw:e2e                      # playwright (starts vite on :3000)
```

API env (`.env`, see `.env.example`): `PORT`, `CONNECTION_URI`, `DATABASE_NAME`. Unit tests get these from `packages/api/src/test-setup.ts` (preloaded via `bunfig.toml`).

Integration tests: `docker compose -f docker-compose.test.yml up -d` starts `mongo:7` on host port `27018` (database `integration-test`), the same port CI's `mongodb` service uses. Then `RUN_INTEGRATION_TESTS=1 bun run --filter @my-app/api test integration`. The template ships no integration test file yet.

## CI / release

`pull-request.yml` (any PR): `lint` → `test` (`tsc --noEmit` + api unit tests), `integration-test` (mongo service on `27018`), `e2e` (Playwright chromium, report uploaded on failure), `fallow` (audit with PR review comments, `gate: all`).

`ci-cd.yml` (push to `main`):

1. `lint` → `test` + `integration-test` (same as PR).
2. `release` — `bunx semantic-release` on `main`. Angular preset; a `release:` commit type forces a major. Bumps root + `packages/{api,web,types}/package.json`, writes `CHANGELOG.md`, commits `chore(release): x.y.z [skip ci]`. No npm publish. Don't edit `CHANGELOG.md` by hand.
3. `build-publish` — pulls the release commit, inits the `workflows-utils` submodule, logs into Docker Hub, runs `.github/workflows-utils/pipelines/scripts/publish-images.sh <app> <version>`. That script reads `utils/pipelines/config/<app>.json` and pushes `docker.io/igurusama/imapps:<tag>-<version>` and `<tag>-latest` for each Dockerfile listed (linux/amd64).
4. `deploy` — POSTs to `DEPLOY_WEB_URL` then `DEPLOY_API_URL` with Cloudflare Access service-token headers, so Dokploy redeploys both apps.

Commit types allowed by `commitlint.config.js`: `feat fix docs style refactor perf test build ci chore revert`. Only `feat` (minor), `fix`/`perf` (patch) and breaking changes cut a release.

### GitHub repo secrets

| Secret | Used by | Purpose |
|--------|---------|---------|
| `DOCKER_USERNAME` | `build-publish` | Docker Hub login |
| `DOCKER_PASSWORD` | `build-publish` | Docker Hub access token |
| `CF_ACCESS_CLIENT_ID` | `deploy` | Cloudflare Access service token id (`CF-Access-Client-Id` header) |
| `CF_ACCESS_CLIENT_SECRET` | `deploy` | Cloudflare Access service token secret |
| `DEPLOY_WEB_URL` | `deploy` | Dokploy deploy webhook for the web app |
| `DEPLOY_API_URL` | `deploy` | Dokploy deploy webhook for the API app |

`GITHUB_TOKEN` is the built-in Actions token (semantic-release pushes the release commit with it). `utils/GITHUB_SECRETS_SETUP.md` only documents the two Docker secrets; the rest are listed here from `ci-cd.yml`.

## Post-scaffold setup

1. Create the GitHub repo `igor-siergiej/my-app` and push.
2. `git submodule add https://github.com/igor-siergiej/utils .github/workflows-utils` (already declared in `.gitmodules`, but the template has no gitlink, so it must be added once; run `git submodule update --init` after cloning).
3. In the `utils` repo, add `pipelines/config/my-app.json` and push it — `publish-images.sh` exits with "Config file not found" without it:
   ```json
   {
     "service": "my-app",
     "dockerfiles": [
       { "dockerfile": "./Dockerfile.api", "tag": "my-app-api" },
       { "dockerfile": "./Dockerfile.web", "tag": "my-app-web" }
     ]
   }
   ```
   Then bump the submodule in the app repo (`git submodule update --remote .github/workflows-utils`) so CI sees it.
4. Add the repo secrets above.
5. Copy `.env.example` to `.env` and fill in Mongo connection details.

## Deploy checklist (homelab)

How the homelab routes and deploys is documented in `foundry/docs/homelab.md`; read §2 (ingress), §3 (deploy flow), §5 (inventory) and §6 (Access) first.

- [ ] First push to `main` with a `feat:`/`fix:` commit → release + images `igurusama/imapps:my-app-{web,api}-latest` exist on Docker Hub.
- [ ] Dokploy, project `apps`: create two applications from Docker image — `my-app-web` (`igurusama/imapps:my-app-web-latest`, container port 3000) and `my-app-api` (`igurusama/imapps:my-app-api-latest`, container port 3001). Same shape as the existing `shoppingo-web` / `shoppingo-api`.
- [ ] Both on `dokploy-network`. API env in Dokploy: `PORT=3001`, `CONNECTION_URI` pointing at `mongodb:27017` (container name on `dokploy-network`, never a `*.imapps.uk` name — see homelab §2), `DATABASE_NAME`. Mongo user/credentials for a new database: not determined from these repos.
- [ ] Domains: `my-app.imapps.uk` → web (port 3000, path `/`) and `my-app.imapps.uk` + path `/api` → api (port 3001), HTTPS via the `letsencrypt` resolver. The nginx in `Dockerfile.web` has no `/api` proxy, so the Traefik `/api` router is required. If `/api` returns the SPA's HTML, the router file is missing — `domain.update` on the API domain regenerates it (homelab §10).
- [ ] Copy each app's deploy webhook URL into `DEPLOY_WEB_URL` / `DEPLOY_API_URL`, and create a Cloudflare Access service token for `CF_ACCESS_CLIENT_*` that the Access app in front of those URLs accepts. Which Access app/policy that is, is not recorded in these repos.
- [ ] Cloudflare Access: the wildcard `*.imapps.uk` app requires owner email by default. Public / own-auth apps need an explicit Bypass app (as shoppingo, kivo, jewellery-catalogue have). Access only gates remote traffic; LAN/tailnet clients bypass it via blocky.
- [ ] Monitoring: add a Gatus check on `https://my-app.imapps.uk/api/health` in `foundry/monitoring/config/gatus/config.yaml`, and a row in `foundry/docs/homelab.md` §5.
- [ ] Backups: a database in the shared `mongodb` is already covered by `foundry/backups/config/mongodb.sh` (full `mongodump` of all DBs). Other stateful stores (e.g. MinIO buckets) need their own `foundry/backups/config/<service>.sh` (homelab §9).
- [ ] If a CI deploy doesn't take, redeploy explicitly via dokploy-mcp (`application-deploy`) rather than re-pushing.

## Known gaps in the template

- `commitlint` and `@commitlint/config-conventional` are not in `devDependencies`, and the `commit-msg` hook runs `bunx --no-install commitlint`. Add them (`bun add -d @commitlint/cli @commitlint/config-conventional`) or the hook fails.
- `bun.lock` is not shipped; it's created on first `bun install` and must be committed (both Dockerfiles `COPY bun.lock` and use `--frozen-lockfile`).
- CI runs `bun run --filter @my-app/api test integration` but no integration test file exists yet.
