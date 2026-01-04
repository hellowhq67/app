'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Bell, Moon, Sun, Monitor } from 'lucide-react';

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
}

export function PreferencesSettings({
    theme,
    notifications,
    onThemeChange,
    onNotificationsChange,
}: PreferencesSettingsProps) {
    const handleNotificationToggle = (key: keyof NotificationPrefs) => {
        onNotificationsChange({
            ...notifications,
            [key]: !notifications[key],
        });
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sun className="h-5 w-5" />
                        Appearance
                    </CardTitle>
                    <CardDescription>
                        Customize how the application looks
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <RadioGroup
                        value={theme}
                        onValueChange={onThemeChange}
                        className="grid grid-cols-3 gap-4"
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
                            <RadioGroupItem
                                value="dark"
                                id="dark"
                                className="peer sr-only"
                            />
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
                            checked={notifications.emailNotifications}
                            onCheckedChange={() => handleNotificationToggle('emailNotifications')}
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
                            checked={notifications.practiceReminders}
                            onCheckedChange={() => handleNotificationToggle('practiceReminders')}
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
                            checked={notifications.testResults}
                            onCheckedChange={() => handleNotificationToggle('testResults')}
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
                            checked={notifications.marketingEmails}
                            onCheckedChange={() => handleNotificationToggle('marketingEmails')}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
