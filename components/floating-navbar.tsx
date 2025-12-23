"use client";
import React, { useMemo } from "react";
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
    ChevronDown
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const FloatingNavbar = ({ className }: { className?: string }) => {
    const pathname = usePathname();

    const { data: user } = useSWR<User>('/api/user', fetcher, {
        onError: (err) => console.error('SWR Error:', err),
        errorRetryCount: 0,
    });

    const menu = useMemo(
        () => [
            {
                title: 'Practice',
                items: [
                    { href: '/pte/academic/practice', label: 'Academic Practice', icon: BookOpen },
                    { href: '/pte/templates', label: 'Templates', icon: FileText },
                    { href: '/pte/vocab-books', label: 'Vocab Books', icon: Layers },
                    { href: '/pte/shadowing', label: 'Shadowing', icon: LayoutGrid },
                ],
            },
            {
                title: 'Tests',
                items: [
                    { href: '/pte/mock-tests', label: 'Mock Tests', icon: Sparkles },
                    { href: '/pte/mock-tests/sectional', label: 'Sectional Tests', icon: Sparkles },
                ],
            },
            {
                title: 'Insights',
                items: [
                    { href: '/pte/analytics', label: 'Analytics', icon: BarChart3 },
                    { href: '/pte/profile', label: 'Profile', icon: UserIcon },
                ],
            },
        ],
        []
    );

    const navItems = [
        { name: "Blog", link: "/blog" },
        { name: "Pricing", link: "/pricing" },
        { name: "Contact", link: "/contact" },
    ];

    return (
        <div
            className={cn(
                "sticky top-0 z-[5000] w-full px-6 py-4 bg-background/80 backdrop-blur-md border-b border-border shadow-sm flex items-center transition-all duration-200",
                className
            )}
        >
            {/* Logo / Home - Absolute Left */}
            <Link href="/" className="flex items-center gap-2 absolute left-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold text-sm shadow-sm">
                    P
                </div>
                <span className="hidden sm:block font-bold text-sm tracking-tight text-foreground/90">Pedagogist</span>
            </Link>

            {/* Desktop Nav - Centered */}
            <div className="hidden md:flex items-center gap-2 text-sm font-medium mx-auto">
                <Popover>
                    <PopoverTrigger className="px-4 py-2 hover:bg-accent/50 rounded-full transition-colors text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 group">
                        Explore
                        <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </PopoverTrigger>
                    <PopoverContent align="center" className="w-[40rem] p-5 shadow-xl border-border/50 bg-background/95 backdrop-blur-sm">
                        <div className="grid grid-cols-3 gap-6">
                            {menu.map((section) => (
                                <div key={section.title}>
                                    <div className="text-xs uppercase text-muted-foreground mb-3 font-bold tracking-wider">{section.title}</div>
                                    <div className="flex flex-col gap-1.5">
                                        {section.items.map(({ href, label, icon: Icon }) => (
                                            <Link key={href} href={href} className="text-sm p-2.5 -mx-2.5 hover:bg-accent/80 rounded-lg flex items-center gap-2.5 text-foreground/80 hover:text-foreground transition-all duration-200 group">
                                                <div className="p-1.5 rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
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
                            "px-4 py-2 rounded-full transition-all duration-200 font-medium",
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
            <div className="flex items-center gap-3 ml-auto">
                <ThemeSwitcher />

                {user ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger className="outline-none">
                            <Avatar className="h-8 w-8 border-2 border-transparent hover:border-border transition-all duration-200 shadow-sm">
                                <AvatarImage src={(user as any).image || ''} alt={user.name || ''} />
                                <AvatarFallback className="bg-primary/10 text-primary font-semibold">{(user.name?.[0] || 'U').toUpperCase()}</AvatarFallback>
                            </Avatar>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 p-2 shadow-xl border-border/50">
                            <DropdownMenuLabel className="p-2">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-semibold leading-none">{user.name}</p>
                                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="my-1" />
                            <DropdownMenuItem asChild className="p-2 cursor-pointer rounded-md focus:bg-accent">
                                <Link href="/pte/dashboard" className="flex items-center">
                                    <LayoutGrid className="mr-2.5 h-4 w-4 text-muted-foreground" />
                                    Dashboard
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="p-2 cursor-pointer rounded-md focus:bg-accent">
                                <Link href="/pte/profile" className="flex items-center">
                                    <UserIcon className="mr-2.5 h-4 w-4 text-muted-foreground" />
                                    Profile
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="my-1" />
                            <form action={signOutAction} className="w-full">
                                <button type="submit" className="w-full text-left">
                                    <DropdownMenuItem className="p-2 cursor-pointer rounded-md text-destructive focus:bg-destructive/10 focus:text-destructive font-medium">
                                        <LogOut className="mr-2.5 h-4 w-4" />
                                        Sign out
                                    </DropdownMenuItem>
                                </button>
                            </form>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <>
                        <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex rounded-full px-5 text-muted-foreground hover:text-foreground font-medium">
                            <Link href="/sign-in">Sign In</Link>
                        </Button>
                        <Button asChild size="sm" className="rounded-full bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-sm px-5 font-semibold transition-all hover:scale-105 active:scale-95">
                            <Link href="/sign-up">Sign Up</Link>
                        </Button>
                    </>
                )}

                {/* Mobile Menu */}
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden rounded-full h-9 w-9 hover:bg-accent">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="top" className="w-full pt-6 pb-6 rounded-b-[2rem] border-b border-border shadow-2xl">
                        <div className="grid gap-6 px-2">
                            <Link href="/" className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-md">
                                    <span className="text-xl font-bold text-white">P</span>
                                </div>
                                <span className="text-xl font-bold tracking-tight">Pedagogist</span>
                            </Link>

                            <div className="grid grid-cols-2 gap-3">
                                {/* Mobile Specific Links */}
                                {navItems.map(item => (
                                    <Link key={item.link} href={item.link} className="flex items-center p-3 rounded-xl hover:bg-accent/50 transition-colors border border-transparent hover:border-border">
                                        <span className="font-semibold text-lg">{item.name}</span>
                                    </Link>
                                ))}
                                <Link href="/pte/dashboard" className="flex items-center p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
                                    <LayoutGrid className="mr-2.5 h-5 w-5" />
                                    <span className="font-semibold">Dashboard</span>
                                </Link>
                            </div>

                            {user && (
                                <form action={signOutAction} className="mt-2">
                                    <Button variant="outline" type="submit" className="w-full justify-center h-12 text-destructive hover:text-destructive hover:bg-destructive/5 border-destructive/20 text-base font-medium rounded-xl">
                                        <LogOut className="mr-2 h-5 w-5" />
                                        Sign Out
                                    </Button>
                                </form>
                            )}
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </div>
    );
};
