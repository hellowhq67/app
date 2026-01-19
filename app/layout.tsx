import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Suspense } from 'react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { RootProvider } from '@/components/providers/root-provider'
import { CopilotKit } from "@copilotkit/react-core";
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'https://www.pedagogistspte.com/'
    // Dev fallback
  ),
  title: 'PedagogistsPTE',
  description:
    'Advanced PTE Academic preparation platform with AI-powered practice and scoring.',
  openGraph: {
    title: 'Pedagogists PTE',
    description: 'Master PTE with AI Excellence',
    images: [{ url: '/og-image.png' }],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
}

// Font configuration - uses system fonts with CSS variable for flexibility
// In production with Google Fonts access, you can re-enable:
// import { Manrope } from 'next/font/google'
// const manrope = Manrope({ subsets: ['latin'], display: 'swap', variable: '--font-manrope' })
const fontClassName = 'font-sans'
const fontVariable = ''

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={fontVariable} suppressHydrationWarning>
      <body className={`min-h-[100dvh] ${fontClassName} antialiased`} suppressHydrationWarning>
        <Suspense fallback={null}>
          <RootProvider>
            <CopilotKit runtimeUrl="/api/copilotkit">
              {children}
            </CopilotKit>

            <SpeedInsights />
          </RootProvider>
        </Suspense>
      </body>
    </html>
  )
}
