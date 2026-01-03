import { Suspense } from "react";
import MockTestClient, { MockTestHistoryItem } from "./MockTestClient";
import { getUserMockTests } from "@/lib/actions/mock-test";

export const dynamic = "force-dynamic";

export default async function MockTestPage() {
    // Fetch user history on the server
    const result = await getUserMockTests();

    // Transform the data to match the component's expected structure
    const history: MockTestHistoryItem[] = result.data ? result.data.map(item => ({
        ...item,
        status: item.status as "completed" | "in_progress" | "not_started" | "expired" | "abandoned"
    })) : [];

    return (
        <Suspense fallback={<div className="container mx-auto py-8">Loading...</div>}>
            <MockTestClient initialHistory={history} />
        </Suspense>
    );
}
