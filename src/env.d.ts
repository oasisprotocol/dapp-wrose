/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_REACT_APP_BUILD_VERSION: string
  readonly VITE_REACT_APP_BUILD_DATETIME: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
