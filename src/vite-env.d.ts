/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />

interface ImportMetaEnv {
  readonly VITE_AUTHOR_NAME?: string
  readonly VITE_X_URL?: string
  readonly VITE_X_HANDLE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
