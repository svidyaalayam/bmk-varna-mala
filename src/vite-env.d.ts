/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BMK_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
