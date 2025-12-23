// Type shims for optional UI libs to satisfy TypeScript during DB-focused work

declare module '@radix-ui/react-dialog' {
  export const Root: any
  export const Trigger: any
  export const Portal: any
  export const Close: any
  export const Overlay: any
  export const Content: any
  export const Title: any
  export const Description: any
}

declare module '@radix-ui/react-tooltip' {
  export const Provider: any
  export const Root: any
  export const Trigger: any
  export const Content: any
}

declare module 'framer-motion' {
  export const motion: any
}

// Back-compat shim in case some files import from next-themes/dist/types
declare module 'next-themes/dist/types' {
  export type ThemeProviderProps = any
}
