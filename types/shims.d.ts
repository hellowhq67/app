// Type shims for optional UI libs to satisfy TypeScript during DB-focused work


// Back-compat shim in case some files import from next-themes/dist/types
declare module 'next-themes/dist/types' {
  export type ThemeProviderProps = any
}
