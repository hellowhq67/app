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
  GraduationCap,
  FlaskConical,
  Library,
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
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Practice Hub",
    url: "/academic/practice",
    icon: SquareTerminal,
    isActive: true,
    items: [
      {
        title: "Speaking",
        url: "/academic/practice/speaking",
        icon: Mic,
      },
      {
        title: "Writing",
        url: "/academic/practice/writing",
        icon: PenTool,
      },
      {
        title: "Reading",
        url: "/academic/practice/reading",
        icon: BookOpen,
      },
      {
        title: "Listening",
        url: "/academic/practice/listening",
        icon: Headphones,
      },
    ],
  },
  {
    title: "Mock Tests",
    url: "/academic/mock-tests",
    icon: Trophy,
  },
  {
    title: "Sectional Tests",
    url: "/academic/sectional-test",
    icon: Frame,
  },
  {
    title: "Courses",
    url: "/courses",
    icon: GraduationCap,
  },
  {
    title: "Research",
    url: "/research",
    icon: FlaskConical,
  },
  {
    title: "Publications",
    url: "/publications",
    icon: Library,
  },
  {
    title: "Practice History",
    url: "/academic/practice-attempts",
    icon: History,
  },
  {
    title: "Analytics",
    url: "/academic/analytics",
    icon: PieChart,
  },
  {
    title: "AI Tutor",
    url: "/ai-tutor",
    icon: Bot,
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
              <Link href="/dashboard">
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
