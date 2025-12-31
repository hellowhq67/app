import { PTELayoutClient } from "@/components/pte/pte-layout-client"

export default function MockTestSessionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <PTELayoutClient>{children}</PTELayoutClient>
}
