"use client";

import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { PTEAppSidebar } from "@/components/pte/pte-app-sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, History, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPteQuestions } from "@/lib/db/queries/pte-questions";
import { TestSection } from "@/lib/types";

export default function ReadingPracticePage() {
    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadQuestions() {
            try {
                const data = await getPteQuestions(TestSection.READING);
                setQuestions(data);
            } catch (error) {
                console.error("Failed to load reading questions:", error);
            } finally {
                setLoading(false);
            }
        }
        loadQuestions();
    }, []);

    return (
        <SidebarProvider>
            <div className="min-h-screen flex w-full bg-background">
                <PTEAppSidebar />

                <div className="flex-1 flex flex-col min-w-0">
                    {/* Header */}
                    <header className="border-b bg-card/50 backdrop-blur sticky top-0 z-10">
                        <div className="px-4 py-3 flex items-center gap-4">
                            <SidebarTrigger>
                                <Button variant="ghost" size="icon">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SidebarTrigger>
                            <h1 className="text-lg font-bold gradient-text">
                                Reading Practice
                            </h1>
                        </div>
                    </header>

                    {/* Main Content */}
                    <main className="flex-1 p-4 overflow-auto">
                        <Tabs
                            defaultValue="practice"
                            className="space-y-6 max-w-4xl mx-auto"
                        >
                            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
                                <TabsTrigger value="practice" className="gap-2">
                                    <BookOpen className="h-4 w-4" /> Practice
                                </TabsTrigger>
                                <TabsTrigger value="history" className="gap-2">
                                    <History className="h-4 w-4" /> History
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="practice">
                                <div className="text-center py-12">
                                    <h2 className="text-2xl font-bold mb-2">Reading Practice</h2>
                                    {loading ? (
                                        <p className="text-muted-foreground">
                                            Loading questions...
                                        </p>
                                    ) : questions.length > 0 ? (
                                        <div className="space-y-4">
                                            <p className="text-muted-foreground">
                                                {questions.length} questions available
                                            </p>
                                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                                {questions.map((q) => (
                                                    <div
                                                        key={q.id}
                                                        className="p-4 border rounded-lg hover:border-primary transition-colors"
                                                    >
                                                        <h3 className="font-semibold">{q.title}</h3>
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            {q.typeName}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground">
                                            No reading questions available yet.
                                        </p>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="history">
                                <div className="text-center py-12">
                                    <p className="text-muted-foreground">
                                        Your practice history will appear here
                                    </p>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}
