'use client'

import { memo, useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Suspense } from 'react'
import {
    BookOpen, FileText, Sparkles, BarChart3, UserIcon, LogOut, Menu,
    Mic, PenTool, Headphones, Trophy, Target, History, ChevronDown,
    Home, DollarSign, MessageSquare, GraduationCap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel
} from '@/components/ui/dropdown-menu'
import {
    NavigationMenu, NavigationMenuContent, NavigationMenuItem,
    NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger
} from '@/components/ui/navigation-menu'
import { ModeToggle } from '@/components/mode-toggle'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet'
import { authClient, useAuth } from '@/lib/auth/client'
import { cn } from '@/lib/utils'

const UserMenu = memo(function UserMenu() {
    const router = useRouter()
    const { user, isPending, isAuthenticated } = useAuth()

    if (isPending) {
        return <div className="h-9 w-24 animate-pulse rounded-full bg-muted" />
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
        )
    }

    const handleSignOut = async () => {
        await authClient.signOut()
        router.push('/')
    }

    const initials = (user.name || user.email || 'U')
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

    return (
        <div className="flex items-center gap-2 sm:gap-3">
            <Button asChild variant="default" size="sm" className="hidden sm:flex">
                <Link href="/pte/dashboard">
                    <Home className="mr-2 h-4 w-4" />
                    Dashboard
                </Link>
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                        <Avatar className="h-9 w-9">
                            <AvatarImage alt={user.name || ''} src={user.image || ''} />
                            <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user.name}</p>
                            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link href="/pte/dashboard" className="cursor-pointer">
                            <Home className="mr-2 h-4 w-4" />
                            Dashboard
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href="/pte/profile" className="cursor-pointer">
                            <UserIcon className="mr-2 h-4 w-4" />
                            Profile
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href="/pte/billing" className="cursor-pointer">
                            <DollarSign className="mr-2 h-4 w-4" />
                            Billing
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600">
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
})

const practiceItems = [
    {
        title: 'Speaking',
        href: '/pte/academic/practice/speaking',
        description: 'Read Aloud, Repeat Sentence, Describe Image',
        icon: Mic,
    },
    {
        title: 'Writing',
        href: '/pte/academic/practice/writing',
        description: 'Summarize Written Text, Write Essay',
        icon: PenTool,
    },
    {
        title: 'Reading',
        href: '/pte/academic/practice/reading',
        description: 'Multiple Choice, Re-order, Fill in Blanks',
        icon: BookOpen,
    },
    {
        title: 'Listening',
        href: '/pte/academic/practice/listening',
        description: 'Summarize Spoken Text, Dictation',
        icon: Headphones,
    },
]

const testItems = [
    {
        title: 'Full Mock Test',
        href: '/pte/academic/mock-tests',
        description: 'Complete 2-hour simulated PTE exam',
        icon: Trophy,
    },
    {
        title: 'Sectional Test',
        href: '/pte/academic/sectional-test',
        description: 'Practice one section at a time',
        icon: Target,
    },
]

const insightItems = [
    {
        title: 'Analytics',
        href: '/pte/academic/analytics',
        description: 'Track your progress and scores',
        icon: BarChart3,
    },
    {
        title: 'Practice History',
        href: '/pte/academic/practice-attempts',
        description: 'Review your past attempts',
        icon: History,
    },
]

const ListItem = ({
    className,
    title,
    href,
    description,
    icon: Icon,
}: {
    className?: string
    title: string
    href: string
    description: string
    icon: React.ElementType
}) => {
    return (
        <li>
            <NavigationMenuLink asChild>
                <Link
                    href={href}
                    className={cn(
                        'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
                        className
                    )}
                >
                    <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-primary" />
                        <div className="text-sm font-medium leading-none">{title}</div>
                    </div>
                    <p className="line-clamp-2 text-xs leading-snug text-muted-foreground mt-1">
                        {description}
                    </p>
                </Link>
            </NavigationMenuLink>
        </li>
    )
}

const Navbar = memo(function Navbar() {
    const pathname = usePathname()
    const [isScrolled, setIsScrolled] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/')

    return (
        <header
            className={cn(
                'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
                isScrolled
                    ? 'bg-background/95 backdrop-blur-md border-b shadow-sm py-2'
                    : 'bg-transparent py-4'
            )}
        >
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 shadow-md">
                        <span className="text-lg font-bold text-white">P</span>
                    </div>
                    <span className={cn(
                        'font-bold transition-all duration-300',
                        isScrolled ? 'text-lg' : 'text-xl'
                    )}>
                        Pedagogist&apos;s PTE
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <NavigationMenu className="hidden lg:flex">
                    <NavigationMenuList>
                        {/* Practice Dropdown */}
                        <NavigationMenuItem>
                            <NavigationMenuTrigger className="bg-transparent">
                                Practice
                            </NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                                    {practiceItems.map((item) => (
                                        <ListItem
                                            key={item.title}
                                            title={item.title}
                                            href={item.href}
                                            description={item.description}
                                            icon={item.icon}
                                        />
                                    ))}
                                </ul>
                            </NavigationMenuContent>
                        </NavigationMenuItem>

                        {/* Tests Dropdown */}
                        <NavigationMenuItem>
                            <NavigationMenuTrigger className="bg-transparent">
                                Tests
                            </NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <ul className="grid w-[400px] gap-3 p-4">
                                    {testItems.map((item) => (
                                        <ListItem
                                            key={item.title}
                                            title={item.title}
                                            href={item.href}
                                            description={item.description}
                                            icon={item.icon}
                                        />
                                    ))}
                                </ul>
                            </NavigationMenuContent>
                        </NavigationMenuItem>

                        {/* Insights Dropdown */}
                        <NavigationMenuItem>
                            <NavigationMenuTrigger className="bg-transparent">
                                Insights
                            </NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <ul className="grid w-[400px] gap-3 p-4">
                                    {insightItems.map((item) => (
                                        <ListItem
                                            key={item.title}
                                            title={item.title}
                                            href={item.href}
                                            description={item.description}
                                            icon={item.icon}
                                        />
                                    ))}
                                </ul>
                            </NavigationMenuContent>
                        </NavigationMenuItem>

                        {/* Direct Links */}
                        <NavigationMenuItem>
                            <Link href="/pricing" legacyBehavior passHref>
                                <NavigationMenuLink
                                    className={cn(
                                        'group inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50',
                                        isActive('/pricing') && 'text-foreground font-semibold'
                                    )}
                                >
                                    Pricing
                                </NavigationMenuLink>
                            </Link>
                        </NavigationMenuItem>

                        <NavigationMenuItem>
                            <Link href="/blog" legacyBehavior passHref>
                                <NavigationMenuLink
                                    className={cn(
                                        'group inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50',
                                        isActive('/blog') && 'text-foreground font-semibold'
                                    )}
                                >
                                    Blog
                                </NavigationMenuLink>
                            </Link>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>

                {/* Right Side */}
                <div className="flex items-center gap-2">
                    <ModeToggle />
                    <Suspense fallback={<div className="h-9 w-24 animate-pulse rounded-full bg-muted" />}>
                        <UserMenu />
                    </Suspense>

                    {/* Mobile Menu */}
                    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                        <SheetTrigger asChild className="lg:hidden">
                            <Button variant="ghost" size="icon">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Open menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px] sm:w-[350px]">
                            <SheetHeader>
                                <SheetTitle className="text-left">Menu</SheetTitle>
                            </SheetHeader>
                            <nav className="flex flex-col gap-4 mt-6">
                                {/* Practice Section */}
                                <div>
                                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                        Practice
                                    </h3>
                                    <div className="flex flex-col gap-1">
                                        {practiceItems.map((item) => (
                                            <SheetClose asChild key={item.href}>
                                                <Link
                                                    href={item.href}
                                                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent"
                                                >
                                                    <item.icon className="h-4 w-4 text-primary" />
                                                    <span>{item.title}</span>
                                                </Link>
                                            </SheetClose>
                                        ))}
                                    </div>
                                </div>

                                {/* Tests Section */}
                                <div>
                                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                        Tests
                                    </h3>
                                    <div className="flex flex-col gap-1">
                                        {testItems.map((item) => (
                                            <SheetClose asChild key={item.href}>
                                                <Link
                                                    href={item.href}
                                                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent"
                                                >
                                                    <item.icon className="h-4 w-4 text-primary" />
                                                    <span>{item.title}</span>
                                                </Link>
                                            </SheetClose>
                                        ))}
                                    </div>
                                </div>

                                {/* Insights Section */}
                                <div>
                                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                        Insights
                                    </h3>
                                    <div className="flex flex-col gap-1">
                                        {insightItems.map((item) => (
                                            <SheetClose asChild key={item.href}>
                                                <Link
                                                    href={item.href}
                                                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent"
                                                >
                                                    <item.icon className="h-4 w-4 text-primary" />
                                                    <span>{item.title}</span>
                                                </Link>
                                            </SheetClose>
                                        ))}
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <div className="flex flex-col gap-1">
                                        <SheetClose asChild>
                                            <Link
                                                href="/pricing"
                                                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent"
                                            >
                                                <DollarSign className="h-4 w-4" />
                                                <span>Pricing</span>
                                            </Link>
                                        </SheetClose>
                                        <SheetClose asChild>
                                            <Link
                                                href="/blog"
                                                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent"
                                            >
                                                <FileText className="h-4 w-4" />
                                                <span>Blog</span>
                                            </Link>
                                        </SheetClose>
                                        <SheetClose asChild>
                                            <Link
                                                href="/contact"
                                                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent"
                                            >
                                                <MessageSquare className="h-4 w-4" />
                                                <span>Contact</span>
                                            </Link>
                                        </SheetClose>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <SheetClose asChild>
                                        <Button asChild className="w-full">
                                            <Link href="/pte/dashboard">
                                                <Home className="mr-2 h-4 w-4" />
                                                Go to Dashboard
                                            </Link>
                                        </Button>
                                    </SheetClose>
                                </div>
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    )
})

export default Navbar
