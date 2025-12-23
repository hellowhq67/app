import {
    BarChart3,
    BookOpen,
    Bot,
    FileCheck,
    GraduationCap,
    Headphones,
    LayoutDashboard,
    MessageCircle,
    Mic,
    PenSquare,
    Settings,
    Users,
} from 'lucide-react'

export interface NavItem {
    title: string
    href: string
    icon: any
    children?: NavItem[]
    badge?: string
}

export interface NavSection {
    title: string
    items: NavItem[]
}

export const pteNavigation: NavSection[] = [
    {
        title: 'Main',
        items: [
            {
                title: 'Dashboard',
                href: '/pte/dashboard',
                icon: LayoutDashboard,
            },
            {
                title: 'Practice',
                href: '/pte/academic/practice',
                icon: BookOpen,
                children: [
                    {
                        title: 'Speaking',
                        href: '/pte/academic/practice/speaking',
                        icon: Mic,
                    },
                    {
                        title: 'Writing',
                        href: '/pte/academic/practice/writing',
                        icon: PenSquare,
                    },
                    {
                        title: 'Reading',
                        href: '/pte/academic/practice/reading',
                        icon: BookOpen,
                    },
                    {
                        title: 'Listening',
                        href: '/pte/academic/practice/listening',
                        icon: Headphones,
                    },
                ],
            },
            {
                title: 'Section Tests',
                href: '/pte/academic/practice/section-tests',
                icon: FileCheck,
                children: [
                    {
                        title: 'Speaking Tests',
                        href: '/pte/academic/practice/section-tests/speaking',
                        icon: Mic,
                    },
                    {
                        title: 'Writing Tests',
                        href: '/pte/academic/practice/section-tests/writing',
                        icon: PenSquare,
                    },
                    {
                        title: 'Reading Tests',
                        href: '/pte/academic/practice/section-tests/reading',
                        icon: BookOpen,
                    },
                    {
                        title: 'Listening Tests',
                        href: '/pte/academic/practice/section-tests/listening',
                        icon: Headphones,
                    },
                ],
            },
        ],
    },
    {
        title: 'Resources',
        items: [
            {
                title: 'Mock Tests',
                href: '/pte/mock-tests',
                icon: GraduationCap,
                badge: '200+',
            },
            {
                title: 'Templates',
                href: '/pte/templates',
                icon: FileCheck,
            },
            {
                title: 'Study Center',
                href: '/pte/study-center',
                icon: GraduationCap,
            },
            {
                title: 'Analytics',
                href: '/pte/analytics',
                icon: BarChart3,
            },
        ],
    },
    {
        title: 'Community & Support',
        items: [
            {
                title: 'Community',
                href: '/pte/community',
                icon: Users,
            },
            {
                title: 'AI Coach',
                href: '/pte/ai-coach',
                icon: Bot,
            },
            {
                title: 'Support',
                href: '/pte/support',
                icon: MessageCircle,
            },
        ],
    },
    {
        title: 'Account',
        items: [
            {
                title: 'Settings',
                href: '/pte/academic/settings',
                icon: Settings,
            },
        ],
    },
]
