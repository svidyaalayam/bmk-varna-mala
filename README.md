# Varna Mala

Varna Mala is a small React + TypeScript learning app for children aged 6–7. The first lesson set helps children see and trace ten Telugu consonants:

`క ఖ గ ఘ చ జ ట డ త ద`

The app is intentionally backend-free. Character content lives in `src/data/teluguCharacters.ts`, and each character contains its own pronunciation, example word, teaching tip, and ordered SVG stroke paths.

## Run locally

```bash
npm install
npm run dev
```

Create a production build:

```bash
npm run build
npm run start
```

The production server serves the `dist` folder on port 8080, which is the default port expected by Azure App Service.

## Deploy to Azure App Service

1. Create a Linux Node.js App Service in the Azure portal.
2. Set the deployment source to this repository, or deploy the project with Azure CLI:

   ```bash
   az login
   az webapp up --name YOUR_UNIQUE_APP_NAME --resource-group YOUR_RESOURCE_GROUP --runtime "NODE:22-lts"
   ```

3. In **Configuration > General settings**, set the startup command to:

   ```bash
   npm run build && npm start
   ```

4. Set `SCM_DO_BUILD_DURING_DEPLOYMENT` to `true` under **Configuration > Application settings** so Azure installs dependencies before starting.

The Vite build is a single-page app, and `serve -s dist` provides the fallback to `index.html` needed if routes are added later.

## Open from BMK School

BMK UI includes an **వర్ణమాల** link for signed-in users. It opens this app at `/sso` and passes the short-lived BMK access token in the URL hash. Varna Mala uses that token to call BMK `/api/auth/me/`, then removes the token from the browser address bar. The student's name is shown on the welcome screen and printed on worksheets.

Configure the integration:

- In BMK UI, set `VITE_VARNAMALA_URL` to the deployed Varna Mala URL.
- In Varna Mala, set `VITE_BMK_API_URL` to the BMK API/UI origin.
- In Django, allow the Varna Mala origin in CORS settings so the browser can call `/api/auth/me/`.

For local development, use BMK at `http://localhost:8080` and Varna Mala at `http://localhost:5173`.

## Extending the lessons

Add a `CharacterLesson` object to `src/data/teluguCharacters.ts`. The tracing board expects each stroke to include:

- an SVG path in the `500 x 420` view box;
- a start and end point used for child-friendly guidance;
- a short label shown under the stroke demonstration.

The current paths are simplified starter paths for the prototype. Before publishing as a formal handwriting curriculum, have a Telugu teacher or handwriting specialist review the stroke order and replace the paths with educator-approved forms.
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
