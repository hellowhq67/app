"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Mic, PenTool, BookOpen, Headphones } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const SECTIONS = [
    {
        id: "speaking",
        title: "Speaking",
        description: "Read Aloud, Repeat Sentence, Describe Image, Retell Lecture, Answer Short Question.",
        icon: Mic,
        color: "text-blue-500",
        bg: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
        id: "writing",
        title: "Writing",
        description: "Summarize Written Text, Write Essay.",
        icon: PenTool,
        color: "text-yellow-500",
        bg: "bg-yellow-100 dark:bg-yellow-900/20",
    },
    {
        id: "reading",
        title: "Reading",
        description: "Multiple Choice, Re-order Paragraphs, Fill in the Blanks.",
        icon: BookOpen,
        color: "text-green-500",
        bg: "bg-green-100 dark:bg-green-900/20",
    },
    {
        id: "listening",
        title: "Listening",
        description: "Summarize Spoken Text, Multiple Choice, Fill in Blanks, Dictation.",
        icon: Headphones,
        color: "text-purple-500",
        bg: "bg-purple-100 dark:bg-purple-900/20",
    },
];

export default function SectionalTestDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState<string | null>(null);

    const startTest = async (sectionId: string) => {
        try {
            setLoading(sectionId);
            const res = await fetch("/api/sectional-test/start", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ section: sectionId }),
            });

            const data = await res.json();

            if (res.ok && data.testId) {
                router.push(`/academic/sectional-test/${data.testId}`);
            } else {
                toast({
                    title: "Failed to start test",
                    description: data.error || "Please try again later.",
                    variant: "destructive",
                });
                setLoading(null);
            }
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "An unexpected error occurred.",
                variant: "destructive",
            });
            setLoading(null);
        }
    };

    return (
        <div className="container mx-auto py-10 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">PedagogistsPTE Sectional Mastery</h1>
                <p className="text-muted-foreground mt-2">
                    Focus on specific skills with targeted sectional practice tests designed by PedagogistsPTE.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {SECTIONS.map((section) => {
                    const Icon = section.icon;
                    return (
                        <Card key={section.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="space-y-1">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-2 ${section.bg}`}>
                                    <Icon className={`w-6 h-6 ${section.color}`} />
                                </div>
                                <CardTitle>{section.title}</CardTitle>
                                <CardDescription>{section.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm text-muted-foreground">
                                    ~ 30-40 mins
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className="w-full"
                                    onClick={() => startTest(section.id)}
                                    disabled={!!loading}
                                >
                                    {loading === section.id ? "Creating..." : "Start Test"}
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>

            {/* History table could be added here later */}
        </div>
    );
}
