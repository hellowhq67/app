'use client'

import { Suspense, useState, useEffect } from 'react'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { User, Lock, Bell } from 'lucide-react'
import { AccountSettings } from '@/components/billingsdk/account-settings'
import { SecuritySettings } from '@/components/billingsdk/security-settings'
import { PreferencesSettings } from '@/components/billingsdk/preferences-settings'
import { DangerZone } from '@/components/billingsdk/danger-zone'
import { useAuth } from '@/lib/auth/client'
import { toast } from 'sonner'

interface AccountData {
  name: string
  email: string
  joinDate: Date
  avatar: string
}

interface PrefsData {
  emailNotifications: boolean
  practiceReminders: boolean
  testResults: boolean
  marketingEmails: boolean
}

function SettingsHeader() {
  return (
    <div className="space-y-2 mb-8">
      <h1 className="text-4xl font-black tracking-tight">Settings</h1>
      <p className="text-lg text-muted-foreground">Manage your account, preferences, and security</p>
    </div>
  )
}

export default function SettingsPage() {
  const { user, isAuthenticated } = useAuth()
  const [account, setAccount] = useState<AccountData>({
    name: 'User',
    email: 'user@example.com',
    joinDate: new Date(),
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [preferences, setPreferences] = useState<PrefsData>({
    emailNotifications: true,
    practiceReminders: true,
    testResults: true,
    marketingEmails: false,
  })

  useEffect(() => {
    const fetchAccountData = async () => {
      try {
        if (!isAuthenticated || !user) {
          setIsLoading(false)
          return
        }

        // TODO: Replace with actual API call to fetch user profile and preferences
        // const [profileRes, prefsRes] = await Promise.all([
        //   fetch(`/api/user/profile`),
        //   fetch(`/api/user/preferences`)
        // ])
        // const profile = await profileRes.json()
        // const prefs = await prefsRes.json()

        setAccount({
          name: user.name || 'User',
          email: user.email || 'user@example.com',
          joinDate: new Date(),
          avatar: user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
        })
      } catch (error) {
        console.error('Failed to fetch account data:', error)
        toast.error('Failed to load account settings')
      } finally {
        setIsLoading(false)
      }
    }

    if (isAuthenticated && user?.id) {
      fetchAccountData()
    } else {
      setIsLoading(false)
    }
  }, [isAuthenticated, user?.id])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background py-12 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Please log in to access settings</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
  }

  const handleSaveAccount = async (data: { name: string }) => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/user/profile`, {
      //   method: 'PUT',
      //   body: JSON.stringify(data),
      // })

      setAccount(prev => ({ ...prev, name: data.name }))
      toast.success('Account settings saved successfully')
    } catch (error) {
      console.error('Failed to save account:', error)
      toast.error('Failed to save account settings')
    }
  }

  const handleSecurityAction = (action: string) => {
    toast.success(`${action} will be available soon`)
  }

  const handlePreferencesChange = async (prefs: PrefsData) => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/user/preferences`, {
      //   method: 'PUT',
      //   body: JSON.stringify(prefs),
      // })

      setPreferences(prefs)
      toast.success('Preferences updated')
    } catch (error) {
      console.error('Failed to save preferences:', error)
      toast.error('Failed to update preferences')
    }
  }

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure? This action is PERMANENT and cannot be undone.')) {
      // TODO: Replace with actual API call
      toast.success('Account deletion initiated. Please check your email for confirmation.')
    }
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container max-w-4xl mx-auto px-4 space-y-8">
        <SettingsHeader />

        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-secondary/5 border border-white/5">
            <TabsTrigger value="account" className="gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Lock className="w-4 h-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Preferences</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-6">
            <Suspense fallback={<div className="h-48 bg-secondary rounded-lg animate-pulse" />}>
              <AccountSettings
                name={account.name}
                email={account.email}
                joinDate={account.joinDate}
                avatar={account.avatar}
                onSave={handleSaveAccount}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Suspense fallback={<div className="h-96 bg-secondary rounded-lg animate-pulse" />}>
              <SecuritySettings
                twoFAEnabled={false}
                onChangePassword={() => handleSecurityAction('Password change')}
                onEnable2FA={() => handleSecurityAction('2FA setup')}
                onSignOutAll={() => handleSecurityAction('Sign out all devices')}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <Suspense fallback={<div className="h-96 bg-secondary rounded-lg animate-pulse" />}>
              <PreferencesSettings
                theme="dark"
                notifications={preferences}
                onThemeChange={(theme) => {
                  toast.success(`Theme changed to ${theme}`)
                }}
                onNotificationsChange={handlePreferencesChange}
              />
            </Suspense>
          </TabsContent>
        </Tabs>

        <div className="pt-8 border-t border-white/5">
          <DangerZone
            onDeleteAccount={handleDeleteAccount}
          />
        </div>
      </div>
    </div>
  )
}
