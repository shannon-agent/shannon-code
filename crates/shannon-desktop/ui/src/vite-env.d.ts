/// <reference types="vite/client" />

declare module '@fontsource-variable/geist' {
  const css: string
  export default css
}

interface Window {
  __TAURI__?: unknown
}
