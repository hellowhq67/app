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
    url: "/pte/dashboard",
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
        items: [
          {
            title: "Read Aloud",
            url: "/practice/speaking/read_aloud",
          },
          {
            title: "Repeat Sentence",
            url: "/practice/speaking/repeat_sentence",
          },
          {
            title: "Describe Image",
            url: "/practice/speaking/describe_image",
          },
          {
            title: "Re-tell Lecture",
            url: "/practice/speaking/retell_lecture",
          },
          {
            title: "Answer Short Question",
            url: "/practice/speaking/answer_short_question",
          },
          {
            title: "Respond to Situation",
            url: "/practice/speaking/respond_to_situation",
          },
          {
            title: "Summarize Discussion",
            url: "/practice/speaking/summarize_group_discussion",
          },
        ],
      },
      {
        title: "Writing",
        url: "/practice/writing",
        items: [
          {
            title: "Summarize Written Text",
            url: "/practice/writing/summarize_written_text",
          },
          {
            title: "Write Essay",
            url: "/practice/writing/write_essay",
          },
        ],
      },
      {
        title: "Reading",
        url: "/practice/reading",
        items: [
          {
            title: "MC Single Answer",
            url: "/practice/reading/reading_mc_single",
          },
          {
            title: "MC Multiple Answers",
            url: "/practice/reading/reading_mc_multiple",
          },
          {
            title: "Re-order Paragraphs",
            url: "/practice/reading/reorder_paragraphs",
          },
          {
            title: "Fill in the Blanks (Dropdown)",
            url: "/practice/reading/reading_fill_blanks_dropdown",
          },
          {
            title: "Fill in the Blanks (Drag)",
            url: "/practice/reading/reading_fill_blanks_drag",
          },
        ],
      },
      {
        title: "Listening",
        url: "/practice/listening",
        items: [
          {
            title: "Summarize Spoken Text",
            url: "/practice/listening/summarize_spoken_text",
          },
          {
            title: "MC Single Answer",
            url: "/practice/listening/listening_mc_single",
          },
          {
            title: "MC Multiple Answers",
            url: "/practice/listening/listening_mc_multiple",
          },
          {
            title: "Fill in the Blanks",
            url: "/practice/listening/listening_fill_blanks",
          },
          {
            title: "Highlight Correct Summary",
            url: "/practice/listening/highlight_correct_summary",
          },
          {
            title: "Select Missing Word",
            url: "/practice/listening/select_missing_word",
          },
          {
            title: "Highlight Incorrect Words",
            url: "/practice/listening/highlight_incorrect_words",
          },
          {
            title: "Write from Dictation",
            url: "/practice/listening/write_from_dictation",
          },
        ],
      },
    ],
  },
  {
    title: "Mock Tests",
    url: "/pte/mock-tests",
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
    title: "AI Voice Assistant",
    url: "/pte/ai-voice",
    icon: Bot,
  },
  {
    title: "Billing",
    url: "/pte/billing",
    icon: BadgeCheck,
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
                  <span className="truncate font-semibold">Pedagogist</span>
                  <span className="truncate text-xs">AI Learning Platform</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMainPTE items={navMain.map((item: any) => ({
          ...item,
          isActive: item.url === pathname || (item.items?.some((sub: any) => sub.url === pathname) ?? false) || pathname?.startsWith(item.url + '/'),
          items: item.items?.map((sub: any) => ({
            ...sub,
            isActive: sub.url === pathname || (sub.items?.some((child: any) => child.url === pathname) ?? false)
          }))
        }))} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
