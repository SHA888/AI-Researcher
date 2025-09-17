# TODO: Migrate Web GUI from Gradio to React/Vite/Tailwind + FastAPI

This document tracks the explicit tasks to migrate the UI and supporting APIs. Work on branch: `feature/new-ui`.

## High-Level Plan

- [ ] Replace Gradio-based UI with a modern React + Vite + Tailwind frontend in `webui/`.
- [x] Introduce a small FastAPI backend in `backend/` to expose REST endpoints used by the UI.
- [ ] Keep current Python orchestration intact (`main_ai_researcher.py`, `web_ai_researcher.py`) but route new UI actions via REST.
- [ ] Support Dark/Light theme switching (Tailwind class strategy) and High Contrast accessibility.
- [x] Stream logs to the UI via SSE.

---

## Backend (FastAPI) — `backend/`

- [x] Create `backend/main.py` to bootstrap FastAPI app on port 8001.
- [x] Add CORS for `http://127.0.0.1:5173` and later production domains.
- [ ] Endpoints:
  - [x] `GET /api/env`: Return filtered environment variables (API-related and task configs).
  - [x] `PUT /api/env`: Write updates to `.env` via python-dotenv, then `load_dotenv`.
  - [x] `POST /api/run`: Body `{ question, reference, mode }`. Launch run using `main_ai_researcher()` in background; return `{ job_id }`.
  - [x] `GET /api/run/{job_id}/status`: Return minimal status (`running|done|error`) and metadata.
  - [x] `GET /api/logs/stream`: SSE endpoint; tail `global_state.LOG_PATH` and push incremental lines.
- [x] Add `backend/requirements.txt`: `fastapi`, `uvicorn`, `python-dotenv`, `pydantic`, `sse-starlette`.
- [x] Decide where to spawn the job: thread/process. Implement safe cancellation hooks later (optional).

### Integration with existing code
- [x] Import and call `main_ai_researcher.main_ai_researcher()` with `{question, reference, mode}`.
- [x] Ensure `.env`-driven values are honored (CATEGORY, INSTANCE_ID, etc.).
- [x] Update or reuse log path (`global_state.LOG_PATH`) so SSE can stream.

---

## Frontend (React/Vite/Tailwind) — `webui/`

- [x] Scaffold: `npm create vite@latest webui -- --template react-ts`.
- [x] Install Tailwind: `npm i -D tailwindcss postcss autoprefixer` and `npx tailwindcss init -p`.
- [x] Configure Tailwind to use dark mode class strategy and include `index.html`, `src/**/*` in `content`.
- [x] Install client libs: `@tanstack/react-query`, `axios`.

### App structure
- [x] `src/App.tsx` with router and layout.
- [x] Pages:
  - [x] `src/pages/Run.tsx`: Inputs (Prompt, Reference, Mode), Submit, live log panel.
  - [x] `src/pages/Env.tsx`: Env var table (filtered), edit/save, refresh.
  - [x] `src/pages/Logs.tsx`: Dedicated logs with search/download.
  - [x] `src/pages/Home.tsx`: Landing with quick actions.
- [ ] Components:
  - [x] `src/components/ThemeToggle.tsx`: toggles `class="dark"` on `html`; persist in localStorage.
  - [x] `src/components/LogStream.tsx`: SSE client using `EventSource` to `/api/logs/stream`.
  - [x] `src/components/EnvTable.tsx`: Editable table for env vars.
- [ ] API client:
  - [x] `src/api/client.ts` (`axios` with baseURL `/api`).
  - [x] `src/api/env.ts` (`getEnv`, `saveEnv`).
  - [x] `src/api/run.ts` (`startRun`, `getRunStatus`).

### Dev experience
- [x] `vite.config.ts`: proxy `'/api'` → `http://127.0.0.1:8001`.
- [x] NPM scripts: `dev`, `build`, `preview`.
- [x] README: how to run backend (`uvicorn`) + frontend (`npm run dev`).

---

## Theming & Accessibility

- [x] Tailwind dark/light using `html.classList.toggle('dark')` and store in localStorage.
- [x] Add High Contrast mode: CSS variables or Tailwind plugin; toggle independent of theme.
- [ ] Ensure strong color contrast on inputs, tables, buttons; test with dark and light.

---

## Logs & Observability

- [x] Implement SSE in backend to stream log lines.
- [x] Frontend `LogStream` component: auto-scroll, pause/resume, copy/download.
- [ ] Ensure log retention/rotation strategy (optional).

---

## Build & Deploy

- [ ] Add `Dockerfile.webui` for building the React static bundle.
- [ ] Serve static build either via FastAPI `StaticFiles` or separate CDN/service.
- [ ] Optional: Combine into a single container that runs FastAPI and serves `webui/dist`.

---

## Next Up (Prioritized)

- [x] Add routing and layout to `webui/src/App.tsx` using `react-router-dom` with pages: Home, Run, Env, Logs.
- [x] Create API client:
  - [x] `src/api/client.ts` (axios base with `/api`).
  - [x] `src/api/env.ts` (`getEnv`, `saveEnv`).
  - [x] `src/api/run.ts` (`startRun`, `getRunStatus`).
  - [x] `src/api/logs.ts` (`listLogs`, `getDownloadUrl`).
- [x] Build components:
  - [x] `src/components/ThemeToggle.tsx` (persist theme to localStorage; add High Contrast toggle).
  - [x] `src/components/LogStream.tsx` (SSE to `/api/logs/stream`, with pause/resume, filter, copy, download, auto-scroll toggle).
  - [x] `src/components/EnvTable.tsx` (editable env vars table).
- [x] Implement pages:
  - [x] `src/pages/Home.tsx` (landing with quick actions).
  - [x] `src/pages/Run.tsx` (prompt/reference/mode form, start run, status, live logs panel).
  - [x] `src/pages/Env.tsx` (editable env table with save/refresh).
  - [x] `src/pages/Logs.tsx` (dedicated log view with search/download).
- [x] Update `README.md` with backend (`uvicorn backend.main:app --reload --port 8001`) and frontend (`npm run dev`) dev instructions.
- [ ] Add `Dockerfile.webui` and decide serving strategy for `webui/dist` (FastAPI `StaticFiles` vs separate service).

## Clean-up & Decommission

- [ ] Mark Gradio UI as deprecated; keep temporarily for parity testing.
- [ ] Remove Gradio UI after React parity is reached and accepted.
- [ ] Update root documentation and screenshots.

---

## Acceptance Criteria

- [ ] From the React UI, a user can:
  - [ ] Edit/save environment variables.
  - [ ] Start a run (all three modes) and view a status indicator.
  - [ ] See live logs reliably.
  - [ ] Toggle light/dark and high-contrast themes.
- [ ] Backend APIs documented (OpenAPI at `/docs`).
- [ ] README explains backend/frontend dev start, env config, and production build.

---

## Nice-to-Haves (post-MVP)

- [ ] WebSocket fallback for logs if SSE is blocked.
- [ ] Job queue with multiple jobs + history (SQLite).
- [ ] Download artifacts (paper PDF path, generated code zips, etc.).
- [ ] Auth for production (basic/OAuth).

---

## Notes

- Keep branch: `feature/new-ui` for all migration commits.
- Prefer small, incremental PRs (backend scaffold, then env APIs, then logs, then run control, then UI pages).
- Ensure `.env` handling mirrors existing `.env.template` and `web_ai_researcher.py` expectations.
