"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

export default function MockLaunchButton({ mockTestId }: { mockTestId: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleStart = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/mock-test/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mockTestId })
            });

            if (!res.ok) throw new Error("Failed to start");

            const data = await res.json();
            router.push(`/academic/mock-tests/${data.attemptId}`);
        } catch (e) {
            toast({ title: "Error starting test", variant: "destructive" });
            setLoading(false);
        }
    };

    return (
        <Button onClick={handleStart} disabled={loading}>
            {loading ? "Starting..." : "Start Test"}
        </Button>
    );
}
