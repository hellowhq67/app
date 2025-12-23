'use client'

import { AcademicProvider } from '@/components/pte/academic-context'
import { PTEProvider } from '@/components/pte/pte-context'
import { PTEContextSwitcher } from '@/components/pte/context-switcher'
import { PTEAppSidebar } from '@/components/pte/pte-app-sidebar'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,

  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { VoiceAssistantProvider, useVoiceAssistant } from '@/components/pte/voice-assistant-context'
import { VoiceAssistantSidebar } from '@/components/pte/dashboard/VoiceAssistantSidebar'
import { Button } from '@/components/ui/button'
import { Mic } from 'lucide-react'

/**
 * Layout component that wraps its content with PTE, Academic, and Sidebar providers and renders the application sidebar, header (breadcrumb and context switcher), and main content area.
 *
 * @param children - The content to render inside the layout's main content area.
 * @returns The layout element containing the sidebar, header, and main content area that includes `children`.
 */
export function PTELayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <PTEProvider>
      <AcademicProvider>
        <VoiceAssistantProvider>
          <PTELayoutContent>
            {children}
          </PTELayoutContent>
        </VoiceAssistantProvider>
      </AcademicProvider>
    </PTEProvider>
  )
}

function PTELayoutContent({ children }: { children: React.ReactNode }) {
  const { isOpen, close, toggle } = useVoiceAssistant()

  return (
    <SidebarProvider>
      <PTEAppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/pte/dashboard">
                  PTE
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              className="text-muted-foreground hover:text-foreground"
            >
              <Mic className="h-5 w-5" />
            </Button>
            <PTEContextSwitcher />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          {children}
        </div>
      </SidebarInset>
      <VoiceAssistantSidebar isOpen={isOpen} onClose={close} />
    </SidebarProvider>
  )
}