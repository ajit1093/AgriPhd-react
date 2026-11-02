/// <reference types="vite/client" />
/// <reference types="vitest" />

declare module 'path' {
  interface Path {
    resolve(...paths: string[]): string
    join(...paths: string[]): string
    dirname(p: string): string
    basename(p: string, ext?: string): string
    extname(p: string): string
  }
  const path: Path
  export default path
}

declare const __dirname: string
