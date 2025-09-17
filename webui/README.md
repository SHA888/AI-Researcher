# AI-Researcher Web UI (React + Vite + Tailwind)

This is the React/Vite frontend for AI-Researcher. It talks to the FastAPI backend via a dev proxy and provides pages for Home, Run, Env, and Logs.

## Development

1. Install backend dependencies and start FastAPI on port 8001

```bash
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --port 8001
```

OpenAPI docs are available at http://127.0.0.1:8001/docs

2. Install frontend dependencies and start Vite dev server on port 5173

```bash
cd webui
npm install
npm run dev
```

The Vite dev server proxies requests from `/api` to `http://127.0.0.1:8001` (see `vite.config.ts`).

## Pages

- Home: quick entry points.
- Run: start a run via `POST /api/run` and see status and live logs.
- Env: view/edit environment variables via `GET/PUT /api/env`.
- Logs: list, search, view streaming logs and download raw files.

## Theming & Accessibility

- Light/Dark theme toggled via the button in the header (Tailwind dark class).
- High Contrast mode toggle is independent of theme and adds `html.hc` for enhanced contrast.

## Build

```bash
npm run build
npm run preview
```

This produces a static bundle in `dist/`. You can serve this via a static server or integrate with FastAPI `StaticFiles` in production.

---

# React + TypeScript + Vite (template notes)

The content below comes from the Vite template for reference.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
