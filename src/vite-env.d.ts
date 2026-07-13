/// <reference types="vite/client" />

// Typed .env variables (see .env / .env.production)
interface ImportMetaEnv {
  readonly VITE_APP_ENVIRONMENT?: "DEVELOPMENT" | "PRODUCTION";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
