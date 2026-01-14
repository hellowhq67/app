"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Bell, Moon, Sun, Monitor, Loader2 } from "lucide-react";

interface NotificationPrefs {
  emailNotifications: boolean;
  practiceReminders: boolean;
  testResults: boolean;
  marketingEmails: boolean;
}

interface PreferencesSettingsProps {
  theme: string;
  notifications: NotificationPrefs;
  onThemeChange: (theme: string) => void;
  onNotificationsChange: (prefs: NotificationPrefs) => void;
  isSaving?: boolean;
}

export function PreferencesSettings({
  theme,
  notifications,
  onThemeChange,
  onNotificationsChange,
  isSaving = false,
}: PreferencesSettingsProps) {
  const [pendingPrefs, setPendingPrefs] =
    useState<NotificationPrefs>(notifications);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleNotificationToggle = async (key: keyof NotificationPrefs) => {
    const newPrefs = {
      ...pendingPrefs,
      [key]: !pendingPrefs[key],
    };
    setPendingPrefs(newPrefs);
    setIsUpdating(true);

    try {
      await onNotificationsChange(newPrefs);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleThemeChange = (newTheme: string) => {
    onThemeChange(newTheme);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="h-5 w-5" />
            Appearance
          </CardTitle>
          <CardDescription>Customize how the application looks</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={theme}
            onValueChange={handleThemeChange}
            className="grid grid-cols-3 gap-4"
            disabled={isSaving}
          >
            <div>
              <RadioGroupItem
                value="light"
                id="light"
                className="peer sr-only"
              />
              <Label
                htmlFor="light"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <Sun className="mb-3 h-6 w-6" />
                Light
              </Label>
            </div>
            <div>
              <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
              <Label
                htmlFor="dark"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <Moon className="mb-3 h-6 w-6" />
                Dark
              </Label>
            </div>
            <div>
              <RadioGroupItem
                value="system"
                id="system"
                className="peer sr-only"
              />
              <Label
                htmlFor="system"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <Monitor className="mb-3 h-6 w-6" />
                System
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Configure how you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive important updates via email
              </p>
            </div>
            <Switch
              checked={pendingPrefs.emailNotifications}
              onCheckedChange={() =>
                handleNotificationToggle("emailNotifications")
              }
              disabled={isUpdating}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Practice Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Get reminded to practice regularly
              </p>
            </div>
            <Switch
              checked={pendingPrefs.practiceReminders}
              onCheckedChange={() =>
                handleNotificationToggle("practiceReminders")
              }
              disabled={isUpdating}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Test Results</Label>
              <p className="text-sm text-muted-foreground">
                Notifications when scores are ready
              </p>
            </div>
            <Switch
              checked={pendingPrefs.testResults}
              onCheckedChange={() => handleNotificationToggle("testResults")}
              disabled={isUpdating}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Marketing Emails</Label>
              <p className="text-sm text-muted-foreground">
                Receive tips, offers, and updates
              </p>
            </div>
            <Switch
              checked={pendingPrefs.marketingEmails}
              onCheckedChange={() =>
                handleNotificationToggle("marketingEmails")
              }
              disabled={isUpdating}
            />
          </div>

          {isUpdating && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving changes...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
