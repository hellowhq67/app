"use client";

import React from "react";
import { AcademicProvider } from "@/components/providers/academic-provider";
import { usePathname } from "next/navigation";
import { PTEProvider } from "@/components/providers/pte-provider";
import { PTEContextSwitcher } from "@/components/pte/context-switcher";
import { PTEAppSidebar } from "@/components/pte/pte-app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  VoiceAssistantProvider,
  useVoiceAssistant,
} from "@/components/providers/voice-assistant-provider";
import { VoiceAssistantSidebar } from "@/components/pte/dashboard/VoiceAssistantSidebar";
import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";

export function PTELayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <PTEProvider>
      <AcademicProvider>
        <VoiceAssistantProvider>
          <PTELayoutContent>{children}</PTELayoutContent>
        </VoiceAssistantProvider>
      </AcademicProvider>
    </PTEProvider>
  );
}

function PTELayoutContent({ children }: { children: React.ReactNode }) {
  const { isOpen, close, toggle } = useVoiceAssistant();
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <PTEAppSidebar />
      <SidebarInset>
        <header className="flex min-h-16 shrink-0 items-center gap-2 border-b px-4 py-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden sm:block">
                <BreadcrumbLink href="/pte/dashboard">PTE</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden sm:block" />
              {pathname
                ?.split("/")
                .filter(Boolean)
                .slice(1)
                .map((segment, index, array) => {
                  const href = `/pte/${array.slice(0, index + 1).join("/")}`;
                  const isLast = index === array.length - 1;
                  const title =
                    segment.charAt(0).toUpperCase() +
                    segment.slice(1).replace(/_/g, " ");

                  return (
                    <React.Fragment key={href}>
                      <BreadcrumbItem>
                        {isLast ? (
                          <BreadcrumbPage>{title}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink href={href}>{title}</BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {!isLast && (
                        <BreadcrumbSeparator className="hidden sm:block" />
                      )}
                    </React.Fragment>
                  );
                })}
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
        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
      </SidebarInset>
      <VoiceAssistantSidebar isOpen={isOpen} onClose={close} />
    </SidebarProvider>
  );
}
