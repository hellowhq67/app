import { Eye, Clock, Trophy } from "lucide-react";

const tests = [
    {
        name: "Full Mock Test 1",
        duration: "3 hours",
        score: "-",
        status: "Available",
        access: "FREE",
    },
    {
        name: "Full Mock Test 2",
        duration: "3 hours",
        score: "78",
        status: "Completed",
        access: "VIP",
    },
    {
        name: "Full Mock Test 3",
        duration: "3 hours",
        score: "-",
        status: "In Progress",
        access: "VIP",
    },
];

const statusStyles: Record<string, string> = {
    Available:
        "bg-accent text-accent-foreground",
    Completed:
        "bg-muted text-muted-foreground",
    "In Progress":
        "bg-secondary text-secondary-foreground",
};

export function MockTestTable() {
    return (
        <table className="w-full">
            <thead>
                <tr className="bg-muted border-b border-border">
                    <TableHead>Test Name</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                </tr>
            </thead>

            <tbody>
                {tests.map((test) => (
                    <tr
                        key={test.name}
                        className="border-b border-border hover:bg-muted/50 transition-colors"
                    >
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                                <span className="font-medium">
                                    {test.name}
                                </span>

                                <span className="rounded-md border border-border px-2 py-0.5 text-[10px] font-semibold bg-muted text-muted-foreground">
                                    {test.access}
                                </span>
                            </div>
                        </td>

                        <td className="px-6 py-4 text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                {test.duration}
                            </div>
                        </td>

                        <td className="px-6 py-4">
                            {test.score !== "-" ? (
                                <div className="flex items-center gap-2 text-primary font-semibold">
                                    <Trophy className="h-4 w-4" />
                                    {test.score}
                                </div>
                            ) : (
                                <span className="text-muted-foreground">—</span>
                            )}
                        </td>

                        <td className="px-6 py-4">
                            <span
                                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusStyles[test.status]}`}
                            >
                                {test.status}
                            </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                            <button className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm text-foreground hover:bg-muted transition">
                                <Eye className="h-4 w-4" />
                                View
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

function TableHead({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <th
            className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground ${className}`}
        >
            {children}
        </th>
    );
}
