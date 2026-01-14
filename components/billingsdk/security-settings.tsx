"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Lock,
  Shield,
  LogOut,
  Key,
  Smartphone,
  Monitor,
  Clock,
} from "lucide-react";
import { format } from "date-fns";

interface DeviceSession {
  id: string;
  device: string;
  location: string;
  lastActive: Date;
  current: boolean;
}

interface SecuritySettingsProps {
  twoFAEnabled: boolean;
  hasPassword: boolean;
  sessions?: DeviceSession[];
  onChangePassword: () => void;
  onEnable2FA: () => void;
  onSignOutAll: () => void;
}

export function SecuritySettings({
  twoFAEnabled,
  hasPassword,
  sessions = [],
  onChangePassword,
  onEnable2FA,
  onSignOutAll,
}: SecuritySettingsProps) {
  const [isEnabling2FA, setIsEnabling2FA] = useState(false);

  const handleEnable2FA = async () => {
    setIsEnabling2FA(true);
    try {
      await onEnable2FA();
    } finally {
      setIsEnabling2FA(false);
    }
  };

  const getDeviceIcon = (device: string) => {
    if (
      device.toLowerCase().includes("mobile") ||
      device.toLowerCase().includes("phone")
    ) {
      return <Smartphone className="h-4 w-4" />;
    }
    return <Monitor className="h-4 w-4" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security Settings
        </CardTitle>
        <CardDescription>
          Manage your account security and authentication options
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Password Section */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            <Key className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Password</p>
              <p className="text-sm text-muted-foreground">
                {hasPassword
                  ? "Change your password regularly for security"
                  : "Set up a password for your account"}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={onChangePassword}>
            {hasPassword ? "Change Password" : "Set Password"}
          </Button>
        </div>

        {/* Two-Factor Authentication */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            <Lock className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <Badge variant={twoFAEnabled ? "default" : "secondary"}>
              {twoFAEnabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>
          <Button
            variant="outline"
            onClick={handleEnable2FA}
            disabled={isEnabling2FA}
          >
            {isEnabling2FA
              ? "Setting up..."
              : twoFAEnabled
              ? "Manage 2FA"
              : "Enable 2FA"}
          </Button>
        </div>

        {/* Active Sessions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LogOut className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Active Sessions</p>
                <p className="text-sm text-muted-foreground">
                  Manage your logged-in devices
                </p>
              </div>
            </div>
            {sessions.length > 0 && (
              <Button variant="outline" size="sm" onClick={onSignOutAll}>
                Sign Out All
              </Button>
            )}
          </div>

          {sessions.length > 0 ? (
            <div className="space-y-2">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getDeviceIcon(session.device)}
                    <div>
                      <p className="text-sm font-medium">
                        {session.device}
                        {session.current && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            Current
                          </Badge>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {session.location} • Last active{" "}
                        {format(session.lastActive, "MMM d, h:mm a")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-muted/30 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">
                <Monitor className="h-8 w-8 mx-auto mb-2 opacity-50" />
                Only this device is currently logged in
              </p>
            </div>
          )}
        </div>

        {/* Security Tips */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Security Tip
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Enable two-factor authentication to add an extra layer of
                protection to your account. We recommend using an authenticator
                app for best security.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
