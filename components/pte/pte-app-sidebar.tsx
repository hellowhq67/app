"use client";

import * as React from "react";
import Link from "next/link";
import {
  BookOpen,
  Bot,
  Frame,
  PieChart,
  SquareTerminal,
  Home,
  Trophy,
  History,
  Headphones,
  Mic,
  PenTool,
  Settings,
} from "lucide-react";
import { usePathname } from "next/navigation";

import { NavMainPTE } from "@/components/pte/nav-main-pte";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

// Navigation structure
const navMain = [
  {
    title: "Dashboard",
    url: "/pte/dashboard",
    icon: Home,
  },
  {
    title: "Practice Hub",
    url: "/pte/academic/practice",
    icon: SquareTerminal,
    isActive: true,
    items: [
      {
        title: "Speaking",
        url: "/pte/academic/practice/speaking",
        icon: Mic,
      },
      {
        title: "Writing",
        url: "/pte/academic/practice/writing",
        icon: PenTool,
      },
      {
        title: "Reading",
        url: "/pte/academic/practice/reading",
        icon: BookOpen,
      },
      {
        title: "Listening",
        url: "/pte/academic/practice/listening",
        icon: Headphones,
      },
    ],
  },
  {
    title: "Mock Tests",
    url: "/pte/academic/mock-tests",
    icon: Trophy,
  },
  {
    title: "Sectional Tests",
    url: "/pte/academic/sectional-test",
    icon: Frame,
  },
  {
    title: "Practice History",
    url: "/pte/academic/practice-attempts",
    icon: History,
  },
  {
    title: "Analytics",
    url: "/pte/academic/analytics",
    icon: PieChart,
  },
  {
    title: "AI Tutor",
    url: "/pte/ai-tutor",
    icon: Bot,
  },
  {
    title: "Settings",
    url: "/pte/settings",
    icon: Settings,
  },
];

export function PTEAppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/pte/dashboard">
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">PedagogistsPTE</span>
                  <span className="truncate text-xs">PTE Academic SASS</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMainPTE
          items={navMain.map((item: any) => ({
            ...item,
            isActive:
              item.url === pathname ||
              (item.items?.some((sub: any) => sub.url === pathname) ?? false) ||
              pathname?.startsWith(item.url + "/"),
            items: item.items?.map((sub: any) => ({
              ...sub,
              isActive:
                sub.url === pathname ||
                (sub.items?.some((child: any) => child.url === pathname) ??
                  false),
            })),
          }))}
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
