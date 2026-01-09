
import { db } from "@/lib/db";
import { mockTests } from "@/lib/db/schema";
import { eq, like } from "drizzle-orm";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import MockLaunchButton from "@/components/pte/mock-test/MockLaunchButton"; // Verify import path
import { Badge } from "@/components/ui/badge";

export default async function SectionalTestsPage() {
    // Fetch tests that are NOT 'ACADEMIC' full mocks, or explicitly tagged SECTIONAL
    // For now we assume if title contains "Speaking" or "Writing" etc it's sectional, OR we add a type column check.
    // The current schema has 'type', let's use it.

    // Note: I haven't seeded sectional tests efficiently yet, so I'll query all and filter or modify seed script.
    // Let's assume we will seed 'SECTIONAL' type.
    const tests = await db.query.mockTests.findMany({
        where: eq(mockTests.type, 'SECTIONAL') // We need to seed these!
    });

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-2">Sectional Practice Tests</h1>
            <p className="text-muted-foreground mb-8">Focus on specific skills with shorter, targeted mock tests.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tests.length === 0 ? (
                    <p>No sectional tests available yet.</p>
                ) : (
                    tests.map((test) => (
                        <Card key={test.id} className="flex flex-col">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <Badge variant="secondary" className="mb-2">{test.type}</Badge>
                                </div>
                                <CardTitle>{test.title}</CardTitle>
                                <CardDescription>{(test.questions as any[])?.length || 0} Questions</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <p className="text-sm text-muted-foreground">{test.description}</p>
                            </CardContent>
                            <CardFooter>
                                <MockLaunchButton mockTestId={test.id} />
                            </CardFooter>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
