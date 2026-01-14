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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";

interface AccountSettingsProps {
  name: string;
  email: string;
  joinDate: Date;
  avatar: string;
  onSave: (data: { name: string }) => Promise<void>;
  isSaving?: boolean;
}

export function AccountSettings({
  name,
  email,
  joinDate,
  avatar,
  onSave,
  isSaving = false,
}: AccountSettingsProps) {
  const [editName, setEditName] = useState(name);
  const [localIsSaving, setLocalIsSaving] = useState(false);

  const handleSave = async () => {
    if (editName === name) return;

    setLocalIsSaving(true);
    try {
      await onSave({ name: editName });
    } finally {
      setLocalIsSaving(false);
    }
  };

  const isProcessing = isSaving || localIsSaving;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Information</CardTitle>
        <CardDescription>
          Manage your personal details and profile information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{name}</p>
            <p className="text-sm text-muted-foreground">{email}</p>
            <p className="text-xs text-muted-foreground">
              Member since {format(joinDate, "MMMM yyyy")}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Your display name"
              disabled={isProcessing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" value={email} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">
              Email cannot be changed. Contact support for assistance.
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isProcessing || editName === name}
          >
            {isProcessing ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
