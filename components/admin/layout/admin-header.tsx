'use client'

import { usePathname } from 'next/navigation'
import { Bell, ChevronRight, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const breadcrumbMap: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/users': 'Users',
  '/admin/questions': 'Questions',
  '/admin/mock-tests': 'Mock Tests',
  '/admin/status': 'App Status',
}

function getBreadcrumbs(pathname: string) {
  const crumbs: { label: string; href: string }[] = [
    { label: 'Admin', href: '/admin' },
  ]

  const segments = pathname.split('/').filter(Boolean)
  let path = ''
  for (const seg of segments) {
    path += `/${seg}`
    if (breadcrumbMap[path] && path !== '/admin') {
      crumbs.push({ label: breadcrumbMap[path], href: path })
    } else if (!breadcrumbMap[path] && path !== '/admin') {
      // dynamic segment (e.g. user id)
      crumbs.push({ label: seg.replace(/-/g, ' '), href: path })
    }
  }
  return crumbs
}

interface AdminHeaderProps {
  onMenuClick?: () => void
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const pathname = usePathname()
  const crumbs = getBreadcrumbs(pathname)

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      {/* Left: mobile menu + breadcrumbs */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuClick}
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <nav className="flex items-center gap-1 text-sm" aria-label="Breadcrumb">
          {crumbs.map((crumb, i) => (
            <span key={crumb.href} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
              <span
                className={
                  i === crumbs.length - 1
                    ? 'font-medium text-foreground capitalize'
                    : 'text-muted-foreground'
                }
              >
                {crumb.label}
              </span>
            </span>
          ))}
        </nav>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 gap-2 px-2 text-sm">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                A
              </div>
              <span className="hidden sm:block">Admin</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem asChild>
              <a href="/dashboard">Main App</a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href="/account/settings">Settings</a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Sign Out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
