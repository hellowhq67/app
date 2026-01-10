import { db } from "@/lib/db";
import { mockTests } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import Link from 'next/link';

// Simple server action to start test (or we can use client component for fetch)
// Using client fetch in a small client wrapper or just a form here? 
// Let's use a simple Client Component wrapper for the "Start" button to handle the API call + Redirect.

import MockLaunchButton from "@/components/pte/mock-test/MockLaunchButton";

export default async function MockTestsIndex() {
    const tests = await db.query.mockTests.findMany({
        where: (table, { eq }) => eq(table.isActive, true)
    });

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">Available Mock Tests</h1>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {tests.map(test => (
                    <div key={test.id} className="border rounded-lg p-6 shadow-sm hover:shadow-md transition">
                        <h2 className="text-xl font-semibold">{test.title}</h2>
                        <p className="text-gray-500 mb-4">{test.type}</p>
                        <p className="text-sm text-gray-600 mb-6 line-clamp-2">{test.description}</p>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{(test.questions as any[])?.length || 0} Questions</span>
                            <MockLaunchButton mockTestId={test.id} />
                        </div>
                    </div>
                ))}

                {tests.length === 0 && (
                    <div className="text-gray-500">No active mock tests found.</div>
                )}
            </div>
        </div>
    );
}
