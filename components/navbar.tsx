'use client'

import { memo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useEffect } from "react";
import { Suspense } from "react";
import {
    BookOpen,
    FileText,
    Layers,
    LayoutGrid,
    Sparkles,
    BarChart3,
    UserIcon,
    LogOut,
    Menu,
    Wand2,
} from "lucide-react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ModeToggle } from "@/components/mode-toggle";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { authClient, useAuth } from "@/lib/auth/client";

const UserMenu = memo(function UserMenu() {
    const { user, isPending, isAuthenticated } = useAuth();

    if (isPending) {
        return <div className="h-9 w-24 animate-pulse rounded-full bg-muted" />;
    }

    if (!isAuthenticated || !user) {
        return (
            <div className="flex items-center gap-2 sm:gap-3">
                <Button asChild variant="ghost" size="sm">
                    <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button asChild size="sm" className="rounded-full">
                    <Link href="/sign-up">Get Started</Link>
                </Button>
            </div>
        );
    }

    const handleSignOut = async () => {
        await authClient.signOut();
        window.location.reload();
    };

    const initials = (user.name || user.email || 'U')
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="flex items-center gap-3">
            <Button asChild variant="outline">
                <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger
                    aria-haspopup="menu"
                    aria-label="Open user menu"
                    className="inline-flex items-center justify-center rounded-full outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                    <Avatar className="size-9 md:size-10">
                        <AvatarImage alt={user.name || ""} src={user.image || ""} />
                        <AvatarFallback>
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-48 p-2">
                    <DropdownMenuItem
                        className="w-full flex cursor-pointer"
                        onClick={handleSignOut}
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
});

const Navbar = memo(function Navbar() {
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);
    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (latest) => {
        const scrolled = latest > 20;
        if (scrolled !== isScrolled) {
            setIsScrolled(scrolled);
        }
    });

    const baseLinkClass =
        "text-sm font-medium text-muted-foreground hover:text-foreground transition-colors";
    const activeClass = "text-foreground font-medium";
    const linkClass = (href: string) =>
        `${baseLinkClass} ${pathname === href ? activeClass : ""}`;

    const menu = useMemo(
        () => [
            {
                title: "Practice",
                items: [
                    {
                        href: "/academic/practice",
                        label: "Academic Practice",
                        icon: BookOpen,
                    },
                    { href: "/templates", label: "Templates", icon: FileText },
                    { href: "/vocab-books", label: "Vocab Books", icon: Layers },
                    { href: "/shadowing", label: "Shadowing", icon: LayoutGrid },
                    { href: "/wizard", label: "Wizard", icon: Wand2 },
                ],
            },
            {
                title: "Tests",
                items: [
                    { href: "/academic/mock-tests", label: "Mock Tests", icon: Sparkles },
                    {
                        href: "/academic/sectional-test",
                        label: "Sectional Tests",
                        icon: Sparkles,
                    },
                ],
            },
            {
                title: "Insights",
                items: [
                    { href: "/analytics", label: "Analytics", icon: BarChart3 },
                    { href: "/profile", label: "Profile", icon: UserIcon },
                ],
            },
            {
                title: "Resources",
                items: [
                    { href: "/blog", label: "Blog", icon: FileText },
                    { href: "/contact", label: "Contact", icon: FileText },
                ],
            },
        ],
        []
    );

    return (
        <motion.header
            className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${isScrolled
                    ? "bg-background/80 backdrop-blur-md border-border py-2 shadow-sm"
                    : "bg-transparent border-transparent py-4"
                }`}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                        <span className="text-lg font-bold text-white">P</span>
                    </div>
                    <span
                        className={`font-bold transition-all duration-300 ${isScrolled ? "text-lg" : "text-xl"
                            }`}
                    >
                        Pedagogist&apos;s PTE
                    </span>
                </Link>
                <div className="flex items-center gap-2">
                    <nav
                        className="hidden md:flex items-center gap-6 mr-4"
                        role="navigation"
                        aria-label="Primary"
                    >
                        <Popover>
                            <PopoverTrigger className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2 outline-none">
                                Explore
                            </PopoverTrigger>
                            <PopoverContent align="start" className="w-[min(90vw,52rem)] p-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                    {menu.slice(0, 3).map((section) => (
                                        <div key={section.title}>
                                            <div className="text-xs uppercase text-muted-foreground mb-2 font-semibold tracking-wider">
                                                {section.title}
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                {section.items.map(({ href, label, icon: Icon }) => (
                                                    <Link
                                                        key={href}
                                                        href={href}
                                                        className="hover:text-primary inline-flex items-center gap-2 text-sm transition-colors"
                                                    >
                                                        <Icon className="h-4 w-4 text-muted-foreground" />
                                                        {label}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    <div className="md:block hidden">
                                        <div className="text-xs uppercase text-muted-foreground mb-2 font-semibold tracking-wider">
                                            {menu[3].title}
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            {menu[3].items.map(({ href, label, icon: Icon }) => (
                                                <Link
                                                    key={href}
                                                    href={href}
                                                    className="hover:text-primary inline-flex items-center gap-2 text-sm transition-colors"
                                                >
                                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                                    {label}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                        <Link
                            href="/blog"
                            className={linkClass("/blog")}
                            aria-current={pathname === "/blog" ? "page" : undefined}
                        >
                            Blog
                        </Link>
                        <Link
                            href="/pricing"
                            className={linkClass("/pricing")}
                            aria-current={pathname === "/pricing" ? "page" : undefined}
                        >
                            Pricing
                        </Link>
                        <Link
                            href="/shop"
                            className={linkClass("/shop")}
                            aria-current={pathname === "/shop" ? "page" : undefined}
                        >
                            Shop
                        </Link>
                        <Link
                            href="/contact"
                            className={linkClass("/contact")}
                            aria-current={pathname === "/contact" ? "page" : undefined}
                        >
                            Contact
                        </Link>
                    </nav>
                    <ModeToggle />
                    <Suspense fallback={<div className="h-9 w-24 rounded-full bg-muted animate-pulse" />}>
                        <UserMenu />
                    </Suspense>
                    <Sheet>
                        <SheetTrigger
                            aria-label="Open menu"
                            className="md:hidden inline-flex items-center justify-center size-9 rounded-md hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-colors"
                        >
                            <Menu className="size-5" />
                            <span className="sr-only">Open menu</span>
                        </SheetTrigger>
                        <SheetContent side="right" className="p-0 w-[min(85vw,400px)]">
                            <SheetHeader className="p-4 border-b text-left">
                                <SheetTitle>Menu</SheetTitle>
                            </SheetHeader>
                            <div className="flex flex-col py-2">
                                <Link
                                    href="/blog"
                                    className="px-4 py-3 text-base font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                                    aria-label="Go to Blog"
                                >
                                    Blog
                                </Link>
                                <Link
                                    href="/pricing"
                                    className="px-4 py-3 text-base font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                                    aria-label="Go to Pricing"
                                >
                                    Pricing
                                </Link>
                                <Link
                                    href="/shop"
                                    className="px-4 py-3 text-base font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                                    aria-label="Go to Shop"
                                >
                                    Shop
                                </Link>
                                <Link
                                    href="/contact"
                                    className="px-4 py-3 text-base font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                                    aria-label="Go to Contact"
                                >
                                    Contact
                                </Link>
                                <div className="my-2 border-t" />
                                <Link
                                    href="/dashboard"
                                    className="px-4 py-3 text-base font-medium hover:bg-accent hover:text-accent-foreground transition-colors text-primary"
                                    aria-label="Go to Dashboard"
                                >
                                    Go to Dashboard
                                </Link>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </motion.header>
    );
});

export default Navbar;
