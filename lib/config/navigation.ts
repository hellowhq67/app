/**
 * Centralized Navigation Configuration
 * All routes and navigation items are defined here for consistency
 */

// =============================================================================
// Route Definitions
// =============================================================================

export const routes = {
  // Auth routes
  auth: {
    signIn: '/sign-in',
    signUp: '/sign-up',
    forgotPassword: '/forgot-password',
    resetPassword: '/reset-password',
  },

  // Public routes
  public: {
    home: '/',
    pricing: '/pricing',
    blog: '/blog',
    contact: '/contact',
    courses: '/courses',
  },

  // Protected PTE routes
  pte: {
    dashboard: '/pte/dashboard',
    academic: {
      root: '/pte/academic',
      practice: {
        root: '/pte/academic/practice',
        speaking: '/pte/academic/practice/speaking',
        writing: '/pte/academic/practice/writing',
        reading: '/pte/academic/practice/reading',
        listening: '/pte/academic/practice/listening',
      },
      mockTests: {
        root: '/pte/academic/mock-tests',
        test: (testId: string) => `/pte/academic/mock-tests/test/${testId}`,
      },
      sectionalTest: {
        root: '/pte/academic/sectional-test',
        test: (id: string) => `/pte/academic/sectional-test/${id}`,
        result: (id: string) => `/pte/academic/sectional-test/${id}/result`,
      },
      analytics: '/pte/academic/analytics',
      practiceAttempts: '/pte/academic/practice-attempts',
    },
  },

  // Account routes
  account: {
    settings: '/account/settings',
    billing: '/account/billing',
  },

  // Checkout routes
  checkout: {
    root: '/checkout',
    success: '/checkout/success',
    cancel: '/checkout/cancel',
  },
} as const

// =============================================================================
// Auth Redirect Configuration
// =============================================================================

export const authConfig = {
  /** Where to redirect after successful login */
  afterLoginRedirect: routes.pte.dashboard,

  /** Where to redirect unauthenticated users */
  signInRedirect: routes.auth.signIn,

  /** Public routes that don't require authentication */
  publicRoutes: [
    '/',
    '/sign-in',
    '/sign-up',
    '/forgot-password',
    '/reset-password',
    '/pricing',
    '/blog',
    '/contact',
    '/courses',
    '/api/auth/(.*)',
    '/studio(.*)',
    '/legal(.*)',
  ],

  /** Routes that require authentication */
  protectedRoutePatterns: ['/pte', '/pte/(.*)', '/account', '/account/(.*)'],
} as const

// =============================================================================
// Navigation Items
// =============================================================================

export type NavItem = {
  title: string
  href: string
  icon?: string
  description?: string
  disabled?: boolean
  external?: boolean
  badge?: string
}

export type NavSection = {
  title: string
  items: NavItem[]
}

// Main navigation for public pages
export const mainNavItems: NavItem[] = [
  { title: 'Home', href: routes.public.home },
  { title: 'Courses', href: routes.public.courses },
  { title: 'Pricing', href: routes.public.pricing },
  { title: 'Blog', href: routes.public.blog },
  { title: 'Contact', href: routes.public.contact },
]

// PTE Sidebar navigation
export const pteSidebarNav: NavSection[] = [
  {
    title: 'Overview',
    items: [
      {
        title: 'Dashboard',
        href: routes.pte.dashboard,
        icon: 'LayoutDashboard',
      },
      {
        title: 'Analytics',
        href: routes.pte.academic.analytics,
        icon: 'BarChart3',
      },
      {
        title: 'Practice History',
        href: routes.pte.academic.practiceAttempts,
        icon: 'History',
      },
    ],
  },
  {
    title: 'Practice',
    items: [
      {
        title: 'Speaking',
        href: routes.pte.academic.practice.speaking,
        icon: 'Mic',
        description: 'Read Aloud, Repeat Sentence, and more',
      },
      {
        title: 'Writing',
        href: routes.pte.academic.practice.writing,
        icon: 'PenTool',
        description: 'Summarize Written Text, Write Essay',
      },
      {
        title: 'Reading',
        href: routes.pte.academic.practice.reading,
        icon: 'BookOpen',
        description: 'Fill in the Blanks, Multiple Choice',
      },
      {
        title: 'Listening',
        href: routes.pte.academic.practice.listening,
        icon: 'Headphones',
        description: 'Summarize Spoken Text, Write from Dictation',
      },
    ],
  },
  {
    title: 'Tests',
    items: [
      {
        title: 'Mock Tests',
        href: routes.pte.academic.mockTests.root,
        icon: 'ClipboardList',
        description: 'Full-length practice tests',
      },
      {
        title: 'Sectional Tests',
        href: routes.pte.academic.sectionalTest.root,
        icon: 'Layers',
        description: 'Focus on specific sections',
      },
    ],
  },
]

// User dropdown menu items
export const userMenuItems: NavItem[] = [
  { title: 'Dashboard', href: routes.pte.dashboard, icon: 'LayoutDashboard' },
  { title: 'Analytics', href: routes.pte.academic.analytics, icon: 'BarChart3' },
  { title: 'Settings', href: routes.account.settings, icon: 'Settings' },
  { title: 'Billing', href: routes.account.billing, icon: 'CreditCard' },
]

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Check if a path matches any of the public routes
 */
export function isPublicRoute(pathname: string): boolean {
  return authConfig.publicRoutes.some((route) => {
    if (route.includes('(.*)')) {
      const regex = new RegExp(`^${route.replace('(.*)', '.*')}$`)
      return regex.test(pathname)
    }
    return pathname === route
  })
}

/**
 * Check if a path requires authentication
 */
export function isProtectedRoute(pathname: string): boolean {
  return authConfig.protectedRoutePatterns.some((pattern) => {
    if (pattern.includes('(.*)')) {
      const regex = new RegExp(`^${pattern.replace('(.*)', '.*')}$`)
      return regex.test(pathname)
    }
    return pathname === pattern || pathname.startsWith(pattern + '/')
  })
}

/**
 * Get the redirect URL after login (checks for callbackUrl)
 */
export function getAfterLoginRedirect(callbackUrl?: string | null): string {
  if (callbackUrl && !callbackUrl.includes('/sign-in') && !callbackUrl.includes('/sign-up')) {
    return callbackUrl
  }
  return authConfig.afterLoginRedirect
}
