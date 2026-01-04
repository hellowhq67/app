'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Shield, LogOut, Key } from 'lucide-react';

interface SecuritySettingsProps {
    twoFAEnabled: boolean;
    onChangePassword: () => void;
    onEnable2FA: () => void;
    onSignOutAll: () => void;
}

export function SecuritySettings({
    twoFAEnabled,
    onChangePassword,
    onEnable2FA,
    onSignOutAll,
}: SecuritySettingsProps) {
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
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                        <Key className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="font-medium">Password</p>
                            <p className="text-sm text-muted-foreground">
                                Change your password regularly for security
                            </p>
                        </div>
                    </div>
                    <Button variant="outline" onClick={onChangePassword}>
                        Change Password
                    </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                        <Lock className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="font-medium">Two-Factor Authentication</p>
                            <p className="text-sm text-muted-foreground">
                                Add an extra layer of security to your account
                            </p>
                        </div>
                        <Badge variant={twoFAEnabled ? 'default' : 'secondary'}>
                            {twoFAEnabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                    </div>
                    <Button
                        variant="outline"
                        onClick={onEnable2FA}
                    >
                        {twoFAEnabled ? 'Manage 2FA' : 'Enable 2FA'}
                    </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                        <LogOut className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="font-medium">Active Sessions</p>
                            <p className="text-sm text-muted-foreground">
                                Sign out from all devices except this one
                            </p>
                        </div>
                    </div>
                    <Button variant="outline" onClick={onSignOutAll}>
                        Sign Out All
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
