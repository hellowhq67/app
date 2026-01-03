import { PTEAppSidebar } from "@/components/pte/pte-app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function PTELayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <PTEAppSidebar />
      <SidebarInset className="flex flex-col min-h-screen">
        <main className="flex-1">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
