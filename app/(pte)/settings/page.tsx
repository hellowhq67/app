"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Lock, Bell, Shield, Key, LogOut } from "lucide-react";
import { AccountSettings } from "@/components/billingsdk/account-settings";
import { SecuritySettings } from "@/components/billingsdk/security-settings";
import { PreferencesSettings } from "@/components/billingsdk/preferences-settings";
import { DangerZone } from "@/components/billingsdk/danger-zone";
import { useAuth } from "@/lib/auth/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

// TypeScript interfaces for data types
export interface AccountData {
  id: string;
  name: string;
  email: string;
  joinDate: Date;
  avatar: string;
  image?: string;
}

export interface PrefsData {
  emailNotifications: boolean;
  practiceReminders: boolean;
  testResults: boolean;
  marketingEmails: boolean;
  theme?: "light" | "dark" | "system";
}

export interface SecurityData {
  twoFAEnabled: boolean;
  hasPassword: boolean;
  lastPasswordChange?: Date;
}

export interface DeviceSession {
  id: string;
  device: string;
  location: string;
  lastActive: Date;
  current: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

function SettingsHeader() {
  return (
    <div className="space-y-2 mb-8">
      <h1 className="text-4xl font-black tracking-tight">Settings</h1>
      <p className="text-lg text-muted-foreground">
        Manage your account, preferences, and security
      </p>
    </div>
  );
}

// Skeleton loaders for Suspense boundaries
function AccountSkeleton() {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="flex items-center gap-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <div className="flex justify-end">
        <Skeleton className="h-10 w-28" />
      </div>
    </div>
  );
}

function SecuritySkeleton() {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-5 rounded" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        ))}
      </div>
    </div>
  );
}

function PreferencesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-md" />
          ))}
        </div>
      </div>
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-6 w-11 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // State management
  const [account, setAccount] = useState<AccountData | null>(null);
  const [preferences, setPreferences] = useState<PrefsData | null>(null);
  const [security, setSecurity] = useState<SecurityData | null>(null);
  const [sessions, setSessions] = useState<DeviceSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("account");

  // API client configuration
  const apiClient = axios.create({
    baseURL: "/api",
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Add auth header to requests
  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth-token") : null;
    if (token) {
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, []);

  // Fetch all settings data
  const fetchSettingsData = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // Fetch account data, preferences, and security settings in parallel
      const [accountRes, prefsRes, securityRes, sessionsRes] =
        await Promise.allSettled([
          apiClient.get<ApiResponse<AccountData>>("/user"),
          apiClient.get<ApiResponse<PrefsData>>("/user/preferences"),
          apiClient.get<ApiResponse<SecurityData>>("/user/security"),
          apiClient.get<ApiResponse<DeviceSession[]>>("/user/sessions"),
        ]);

      // Handle account data
      if (accountRes.status === "fulfilled" && accountRes.value.data.success) {
        const data = accountRes.value.data.data;
        setAccount({
          id: data.id,
          name: data.name || user.name || "User",
          email: data.email || user.email || "user@example.com",
          joinDate: data.joinDate ? new Date(data.joinDate) : new Date(),
          avatar:
            data.image ||
            data.avatar ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${
              data.email || user.email
            }`,
        });
      } else {
        // Fallback to auth user data
        setAccount({
          id: user.id,
          name: user.name || "User",
          email: user.email || "user@example.com",
          joinDate: new Date(),
          avatar:
            user.image ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
        });
      }

      // Handle preferences
      if (prefsRes.status === "fulfilled" && prefsRes.value.data.success) {
        setPreferences(prefsRes.value.data.data);
      } else {
        setPreferences({
          emailNotifications: true,
          practiceReminders: true,
          testResults: true,
          marketingEmails: false,
          theme: "dark",
        });
      }

      // Handle security
      if (
        securityRes.status === "fulfilled" &&
        securityRes.value.data.success
      ) {
        setSecurity(securityRes.value.data.data);
      } else {
        setSecurity({
          twoFAEnabled: false,
          hasPassword: true,
        });
      }

      // Handle sessions
      if (
        sessionsRes.status === "fulfilled" &&
        sessionsRes.value.data.success
      ) {
        setSessions(sessionsRes.value.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch settings data:", error);
      toast.error("Failed to load settings");

      // Set fallback data
      setAccount({
        id: user.id,
        name: user.name || "User",
        email: user.email || "user@example.com",
        joinDate: new Date(),
        avatar:
          user.image ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
      });
      setPreferences({
        emailNotifications: true,
        practiceReminders: true,
        testResults: true,
        marketingEmails: false,
        theme: "dark",
      });
      setSecurity({
        twoFAEnabled: false,
        hasPassword: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  // Initial data fetch
  useEffect(() => {
    if (!authLoading) {
      fetchSettingsData();
    }
  }, [authLoading, fetchSettingsData]);

  // Handle authentication states
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background py-12 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-muted/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Sign in Required</h2>
          <p className="text-muted-foreground mb-6">
            Please sign in to access your account settings
          </p>
          <a
            href="/sign-in"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  if (isLoading) {
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
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Security</span>
              </TabsTrigger>
              <TabsTrigger value="preferences" className="gap-2">
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">Preferences</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="account">
              <AccountSkeleton />
            </TabsContent>
            <TabsContent value="security">
              <SecuritySkeleton />
            </TabsContent>
            <TabsContent value="preferences">
              <PreferencesSkeleton />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  // Account save handler
  const handleSaveAccount = async (data: { name: string }) => {
    if (!account) return;

    setIsSaving(true);
    try {
      const response = await apiClient.put<ApiResponse<AccountData>>("/user", {
        name: data.name,
      });

      if (response.data.success) {
        setAccount((prev) => (prev ? { ...prev, name: data.name } : null));
        toast.success("Account settings saved successfully");
      } else {
        throw new Error(response.data.message || "Failed to save");
      }
    } catch (error) {
      console.error("Failed to save account:", error);
      toast.error("Failed to save account settings");
    } finally {
      setIsSaving(false);
    }
  };

  // Security action handlers
  const handleChangePassword = async () => {
    try {
      const response = await apiClient.post<
        ApiResponse<{ resetToken: string }>
      >("/user/change-password", {});

      if (response.data.success) {
        toast.success("Password change email sent. Check your inbox.");
      } else {
        toast.error(
          response.data.message || "Failed to initiate password change"
        );
      }
    } catch (error) {
      console.error("Failed to change password:", error);
      toast.error("Failed to initiate password change");
    }
  };

  const handleEnable2FA = async () => {
    try {
      const response = await apiClient.post<ApiResponse<{ qrCode: string }>>(
        "/user/enable-2fa",
        {}
      );

      if (response.data.success) {
        toast.success("2FA setup initiated. Check your email for QR code.");
      } else {
        toast.error(response.data.message || "Failed to enable 2FA");
      }
    } catch (error) {
      console.error("Failed to enable 2FA:", error);
      toast.error("Failed to enable two-factor authentication");
    }
  };

  const handleSignOutAll = async () => {
    try {
      const response = await apiClient.post<ApiResponse<void>>(
        "/user/signout-all",
        {}
      );

      if (response.data.success) {
        setSessions([]);
        toast.success("Signed out from all other devices");
      } else {
        toast.error(response.data.message || "Failed to sign out devices");
      }
    } catch (error) {
      console.error("Failed to sign out devices:", error);
      toast.error("Failed to sign out from other devices");
    }
  };

  // Preferences handler
  const handlePreferencesChange = async (prefs: PrefsData) => {
    try {
      const response = await apiClient.put<ApiResponse<PrefsData>>(
        "/user/preferences",
        prefs
      );

      if (response.data.success) {
        setPreferences(response.data.data);
        toast.success("Preferences updated successfully");
      } else {
        throw new Error(response.data.message || "Failed to save");
      }
    } catch (error) {
      console.error("Failed to save preferences:", error);
      toast.error("Failed to update preferences");
      // Revert to previous state
      if (preferences) {
        setPreferences(preferences);
      }
    }
  };

  // Account deletion handler
  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "Are you sure? This action is PERMANENT and cannot be undone."
      )
    ) {
      return;
    }

    const confirmation = window.prompt(
      'Please type "DELETE" to confirm account deletion:'
    );

    if (confirmation !== "DELETE") {
      toast.error("Confirmation failed. Account not deleted.");
      return;
    }

    try {
      const response = await apiClient.delete<ApiResponse<void>>("/user");

      if (response.data.success) {
        toast.success(
          "Account deletion initiated. You will receive a confirmation email."
        );
        // Redirect to home after a delay
        setTimeout(() => {
          window.location.href = "/";
        }, 3000);
      } else {
        toast.error(
          response.data.message || "Failed to initiate account deletion"
        );
      }
    } catch (error) {
      console.error("Failed to delete account:", error);
      toast.error("Failed to delete account");
    }
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container max-w-4xl mx-auto px-4 space-y-8">
        <SettingsHeader />

        <Tabs
          defaultValue="account"
          className="space-y-6"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-3 bg-secondary/5 border border-white/5">
            <TabsTrigger value="account" className="gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Preferences</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account">
            <Suspense fallback={<AccountSkeleton />}>
              {account && (
                <AccountSettings
                  name={account.name}
                  email={account.email}
                  joinDate={account.joinDate}
                  avatar={account.avatar}
                  onSave={handleSaveAccount}
                  isSaving={isSaving}
                />
              )}
            </Suspense>
          </TabsContent>

          <TabsContent value="security">
            <Suspense fallback={<SecuritySkeleton />}>
              {security && (
                <SecuritySettings
                  twoFAEnabled={security.twoFAEnabled}
                  hasPassword={security.hasPassword}
                  sessions={sessions}
                  onChangePassword={handleChangePassword}
                  onEnable2FA={handleEnable2FA}
                  onSignOutAll={handleSignOutAll}
                />
              )}
            </Suspense>
          </TabsContent>

          <TabsContent value="preferences">
            <Suspense fallback={<PreferencesSkeleton />}>
              {preferences && (
                <PreferencesSettings
                  theme={preferences.theme || "dark"}
                  notifications={{
                    emailNotifications: preferences.emailNotifications,
                    practiceReminders: preferences.practiceReminders,
                    testResults: preferences.testResults,
                    marketingEmails: preferences.marketingEmails,
                  }}
                  onThemeChange={(theme) => {
                    handlePreferencesChange({
                      ...preferences!,
                      theme: theme as PrefsData["theme"],
                    });
                  }}
                  onNotificationsChange={(notifications) => {
                    handlePreferencesChange({
                      ...preferences!,
                      ...notifications,
                    });
                  }}
                />
              )}
            </Suspense>
          </TabsContent>
        </Tabs>

        <div className="pt-8 border-t border-white/5">
          <DangerZone onDeleteAccount={handleDeleteAccount} />
        </div>
      </div>
    </div>
  );
}
