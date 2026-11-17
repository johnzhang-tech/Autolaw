/// <reference types="vite/client" />

/** Build-time values. Every one of them ships in the public JavaScript. */
interface ImportMetaEnv {
  /** Umami Cloud website id for www.autolaw.ai; set in .env.production. */
  readonly VITE_UMAMI_WEBSITE_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
