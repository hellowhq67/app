"use client";

import * as React from "react";
import Link from "next/link";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  Home,
  Trophy,
  History,
  MessageSquare,
  Headphones,
  Mic,
  PenTool,
  BadgeCheck,
  Settings,
  User,
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

// This is sample data.
const navMain = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Practice Hub",
    url: "/practice",
    isActive: true,
    items: [
      {
        title: "Speaking",
        url: "/practice/speaking",
      },
      {
        title: "Writing",
        url: "/practice/writing",
      },
      {
        title: "Reading",
        url: "/practice/reading",
      },
      {
        title: "Listening",
        url: "/practice/listening",
      },
    ],
  },
  {
    title: "Mock Tests",
    url: "/pte/mocktest",
    icon: Trophy,
  },
  {
    title: "Sections workflow",
    url: "/mock-tests",
    icon: Trophy,
  },
  {
    title: "History",
    url: "/pte/history",
    icon: History,
  },
  {
    title: "Community",
    url: "/pte/community",
    icon: MessageSquare,
  },
  {
    title: "knowlodge Base",
    url: "/pte/ai-voice",
    icon: Bot,
  },

  {
    title: "Profile",
    url: "/pte/profile",
    icon: User,
  },
  {
    title: "Billing",
    url: "/billing",
    icon: BadgeCheck,
  },
  {
    title: "Settings",
    url: "/settings",
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
                  <span className="truncate font-semibold">Pedagogist</span>
                  <span className="truncate text-xs">AI Learning Platform</span>
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
