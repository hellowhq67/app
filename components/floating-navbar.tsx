"use client";

import React, { useMemo, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LogOut,
  Menu,
  BookOpen,
  BarChart3,
  LayoutGrid,
  FileText,
  Layers,
  Sparkles,
  User as UserIcon,
  ChevronDown,
  X,
  Home,
} from "lucide-react";
import useSWR from "swr";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { signOutAction } from "@/lib/auth/actions";
import { User } from "@/lib/db/schema";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const MENU_ITEMS = [
  {
    title: "Practice",
    items: [
      {
        href: "/pte/academic/practice",
        label: "Academic Practice",
        icon: BookOpen,
      },
      { href: "/pte/templates", label: "Templates", icon: FileText },
      { href: "/pte/vocab-books", label: "Vocab Books", icon: Layers },
      { href: "/pte/shadowing", label: "Shadowing", icon: LayoutGrid },
    ],
  },
  {
    title: "Tests",
    items: [
      { href: "/pte/mock-tests", label: "Mock Tests", icon: Sparkles },
      {
        href: "/pte/mock-tests/sectional",
        label: "Sectional Tests",
        icon: Sparkles,
      },
    ],
  },
  {
    title: "Insights",
    items: [
      { href: "/pte/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/pte/profile", label: "Profile", icon: UserIcon },
    ],
  },
] as const;

const NAV_ITEMS = [
  { name: "Blog", link: "/blog" },
  { name: "Pricing", link: "/pricing" },
  { name: "Contact", link: "/contact" },
] as const;

export const FloatingNavbar = ({ className }: { className?: string }) => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Fetch user data with error handling
  const { data: user, isLoading: userLoading } = useSWR<User>(
    "/api/user",
    fetcher,
    {
      onError: (err) => console.error("[FloatingNavbar] SWR Error:", err),
      errorRetryCount: 1,
      revalidateOnFocus: false,
      dedupingInterval: 60000,
      shouldRetryOnError: false,
    }
  );

  // Handle scroll effect for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    handleScroll(); // Check initial state
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const menu = useMemo(() => MENU_ITEMS, []);
  const navItems = useMemo(() => NAV_ITEMS, []);

  const getUserInitials = (name?: string | null): string => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSignOut = async (e: React.FormEvent) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    await signOutAction();
  };

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-lg"
          : "bg-background/60 backdrop-blur-md border-b border-transparent",
        className
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        {/* Logo - Left */}
        <Link
          href="/"
          className="flex items-center gap-2 flex-shrink-0 group transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring rounded-lg outline-none"
          aria-label="Pedagogist PTE Home"
        >
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold text-sm shadow-md group-hover:shadow-lg transition-shadow">
            P
          </div>
          <span className="hidden sm:block font-bold text-base tracking-tight text-foreground/90 group-hover:text-foreground transition-colors">
            Pedagogist
          </span>
        </Link>

        {/* Desktop Navigation - Center */}
        <div className="hidden md:flex items-center gap-1 text-sm font-medium flex-1 justify-center px-6">
          <Popover>
            <PopoverTrigger className="px-3 sm:px-4 py-2 hover:bg-accent/50 rounded-lg transition-all duration-200 text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 group outline-none focus-visible:ring-2 focus-visible:ring-ring">
              Explore
              <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </PopoverTrigger>
            <PopoverContent
              align="center"
              sideOffset={12}
              className="w-[45rem] p-6 shadow-xl border border-border/50 bg-background/98 backdrop-blur-xl rounded-xl animate-in fade-in zoom-in-95 duration-200"
            >
              <div className="grid grid-cols-3 gap-8">
                {menu.map((section) => (
                  <div key={section.title} className="space-y-3">
                    <div className="text-xs uppercase text-muted-foreground font-bold tracking-wider opacity-70">
                      {section.title}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {section.items.map(({ href, label, icon: Icon }) => (
                        <Link
                          key={href}
                          href={href}
                          className="text-sm p-2.5 -mx-2.5 hover:bg-accent/80 rounded-lg flex items-center gap-2.5 text-foreground/70 hover:text-foreground transition-all duration-200 group outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <div className="p-1.5 rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200 flex-shrink-0">
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="font-medium">{label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {navItems.map((item) => (
            <Link
              key={item.link}
              href={item.link}
              className={cn(
                "px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 font-medium outline-none text-sm focus-visible:ring-2 focus-visible:ring-ring",
                pathname === item.link
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          <ThemeSwitcher />

          {/* Desktop User Menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full transition-all duration-200">
                <Avatar className="h-8 w-8 sm:h-9 sm:w-9 border-2 border-transparent hover:border-border transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer">
                  <AvatarImage
                    src={(user as any).image || ""}
                    alt={user.name || "User avatar"}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-semibold text-xs sm:text-sm">
                    {getUserInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={12}
                className="w-56 p-2 shadow-xl border border-border/50 bg-background/98 backdrop-blur-xl rounded-lg animate-in fade-in zoom-in-95 duration-200"
              >
                <DropdownMenuLabel className="p-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold leading-none">
                      {user.name || "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email || "No email"}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem
                  asChild
                  className="p-2 cursor-pointer rounded-md focus:bg-accent transition-colors duration-200"
                >
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="p-2 cursor-pointer rounded-md focus:bg-accent transition-colors duration-200"
                >
                  <Link
                    href="/academic/profile"
                    className="flex items-center gap-2"
                  >
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1" />
                <form action={signOutAction} className="w-full">
                  <button type="submit" className="w-full text-left outline-none">
                    <DropdownMenuItem className="p-2 cursor-pointer rounded-md text-destructive focus:bg-destructive/10 focus:text-destructive font-medium transition-colors duration-200">
                      <LogOut className="mr-2.5 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </button>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : !userLoading ? (
            <>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex rounded-lg px-4 text-muted-foreground hover:text-foreground font-medium transition-all duration-200"
              >
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-md px-4 font-semibold transition-all duration-200 hover:shadow-lg active:scale-95 hidden sm:inline-flex"
              >
                <Link href="/sign-up">Sign Up</Link>
              </Button>
            </>
          ) : (
            <div className="h-9 w-9 rounded-full bg-muted/50 animate-pulse" />
          )}

          {/* Mobile Menu Trigger */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden rounded-lg h-9 w-9 hover:bg-accent transition-all duration-200"
                aria-label="Toggle navigation menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="top"
              className="w-full p-0 border-b border-border/50 rounded-b-2xl bg-background/98 backdrop-blur-xl shadow-xl animate-in slide-in-from-top-2 duration-300"
            >
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between p-4 border-b border-border/50">
                <Link
                  href="/"
                  className="flex items-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold shadow-md">
                    P
                  </div>
                  <span className="font-bold text-base">Pedagogist</span>
                </Link>
                <SheetClose asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    aria-label="Close menu"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </SheetClose>
              </div>

              {/* Mobile Menu Content */}
              <div className="overflow-y-auto max-h-[calc(100vh-180px)] px-4 py-6 space-y-6">
                {/* Explore Section */}
                <div>
                  <h3 className="text-xs uppercase font-bold tracking-wider text-muted-foreground mb-3 opacity-70">
                    Explore
                  </h3>
                  <div className="space-y-2">
                    {menu.flatMap((section) =>
                      section.items.map(({ href, label, icon: Icon }) => (
                        <Link
                          key={href}
                          href={href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 text-foreground/80 hover:text-foreground transition-all duration-200 group active:scale-98"
                        >
                          <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200 flex-shrink-0">
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="font-medium text-sm">{label}</span>
                        </Link>
                      ))
                    )}
                  </div>
                </div>

                {/* Main Navigation */}
                <div>
                  <h3 className="text-xs uppercase font-bold tracking-wider text-muted-foreground mb-3 opacity-70">
                    Navigation
                  </h3>
                  <div className="space-y-2">
                    {navItems.map((item) => (
                      <Link
                        key={item.link}
                        href={item.link}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center p-3 rounded-lg transition-all duration-200 font-medium text-sm active:scale-98",
                          pathname === item.link
                            ? "bg-accent text-accent-foreground shadow-sm"
                            : "text-foreground/80 hover:bg-accent/50"
                        )}
                      >
                        <span>{item.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* User Section */}
                {user ? (
                  <div className="border-t border-border/50 pt-6 space-y-2">
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 text-foreground/80 hover:text-foreground transition-all duration-200 group active:scale-98"
                    >
                      <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200 flex-shrink-0">
                        <Home className="h-4 w-4" />
                      </div>
                      <span className="font-medium text-sm">Dashboard</span>
                    </Link>
                    <Link
                      href="/academic/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 text-foreground/80 hover:text-foreground transition-all duration-200 group active:scale-98"
                    >
                      <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200 flex-shrink-0">
                        <UserIcon className="h-4 w-4" />
                      </div>
                      <span className="font-medium text-sm">Profile</span>
                    </Link>
                    <form action={signOutAction} className="w-full">
                      <button
                        type="submit"
                        className="w-full"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <div className="flex items-center gap-3 p-3 rounded-lg text-destructive hover:bg-destructive/10 transition-all duration-200 font-medium text-sm w-full active:scale-98">
                          <div className="p-2 rounded-lg bg-destructive/10 flex-shrink-0">
                            <LogOut className="h-4 w-4" />
                          </div>
                          <span>Sign Out</span>
                        </div>
                      </button>
                    </form>
                  </div>
                ) : !userLoading ? (
                  <div className="border-t border-border/50 pt-6 space-y-2">
                    <Button
                      asChild
                      variant="outline"
                      className="w-full rounded-lg h-11 transition-all duration-200 bg-transparent font-medium"
                    >
                      <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)}>
                        Sign In
                      </Link>
                    </Button>
                    <Button
                      asChild
                      className="w-full rounded-lg h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md font-semibold transition-all duration-200 hover:shadow-lg"
                    >
                      <Link href="/sign-up" onClick={() => setMobileMenuOpen(false)}>
                        Sign Up
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="border-t border-border/50 pt-6 space-y-2">
                    <div className="h-11 w-full rounded-lg bg-muted/50 animate-pulse" />
                    <div className="h-11 w-full rounded-lg bg-muted/50 animate-pulse" />
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};