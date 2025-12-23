import { headers } from 'next/headers'
import { NonceProvider } from './nonce-provider'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { ThemeProvider } from './theme-provider'
import { ToastProvider } from './toast-provider'

export async function NonceWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const nonce = (await headers()).get('x-nonce')

  return (
    <NonceProvider nonce={nonce ?? undefined}>
      <NuqsAdapter>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <ToastProvider />
        </ThemeProvider>
      </NuqsAdapter>
    </NonceProvider>
  )
}