/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_PUSHER_APP_KEY: string;
  readonly VITE_PUSHER_APP_CLUSTER: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
