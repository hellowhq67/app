'use client'

import { GraduationCap, LogOut, Settings, User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { authClient, useAuth } from '@/lib/auth/client'

export function UserNav() {
  const { user, isAuthenticated, isPending } = useAuth()

  const handleLogout = async () => {
    try {
      await authClient.signOut()
      // Optionally redirect after logout
      window.location.href = '/'
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  if (isPending) {
    return (
      <Button
        variant="ghost"
        className="relative h-8 w-8 rounded-full"
        disabled
      >
        <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200"></div>
      </Button>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
        <Avatar className="h-8 w-8">
          <AvatarImage src="/avatars/01.png" alt="Guest" />
          <AvatarFallback>?</AvatarFallback>
        </Avatar>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={user.image || '/avatars/01.png'}
              alt={user.name || 'User'}
            />
            <AvatarFallback>
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm leading-none font-medium">
              {user.name || 'User Name'}
            </p>
            <p className="text-muted-foreground text-xs leading-none">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <a href="/pte/dashboard">
              <GraduationCap className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href="/pte/profile">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href="/pte/settings">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </a>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
