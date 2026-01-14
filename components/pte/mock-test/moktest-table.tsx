"use client";

import {
  Eye,
  Clock,
  Trophy,
  Crown,
  Lock,
  CheckCircle2,
  PlayCircle,
  PauseCircle,
} from "lucide-react";
import { JSX, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { TableHead } from "@/components/ui/table";

type TestStatus = "Available" | "Completed" | "In Progress";
type AccessType = "FREE" | "VIP";

interface MockTest {
  id: string;
  name: string;
  duration: string;
  score: string;
  scorePercent?: number;
  status: TestStatus;
  access: AccessType;
  attempts: number;
  lastAttempt?: string;
  locked?: boolean;
}

/* ---------------------------------- */
/* Mock Data                          */
/* ---------------------------------- */

const tests: MockTest[] = [
  {
    id: "1",
    name: "Full Mock Test 1",
    duration: "3 hours",
    score: "-",
    status: "Available",
    access: "FREE",
    attempts: 0,
  },
  {
    id: "2",
    name: "Full Mock Test 2",
    duration: "3 hours",
    score: "78",
    scorePercent: 78,
    status: "Completed",
    access: "VIP",
    attempts: 1,
    lastAttempt: "12 Jan 2026",
  },
  {
    id: "3",
    name: "Full Mock Test 3",
    duration: "3 hours",
    score: "-",
    status: "In Progress",
    access: "VIP",
    attempts: 2,
    locked: true,
  },
];

/* ---------------------------------- */
/* Status Config (TOKEN SAFE)         */
/* ---------------------------------- */

const statusStyles: Record<TestStatus, string> = {
  Available: "bg-accent text-accent-foreground",
  Completed: "bg-muted text-muted-foreground",
  "In Progress": "bg-secondary text-secondary-foreground",
};

const statusIcons: Record<TestStatus, JSX.Element> = {
  Available: <PlayCircle className="h-3.5 w-3.5" />,
  Completed: <CheckCircle2 className="h-3.5 w-3.5" />,
  "In Progress": <PauseCircle className="h-3.5 w-3.5" />,
};
import { cn } from "@/lib/utils";
/* ---------------------------------- */
/* Component                          */
/* ---------------------------------- */

export function MockTestTable() {
  const router = useRouter();

  /* Pagination */
  const PAGE_SIZE = 2;
  const [page, setPage] = useState(1);

  /* Skeleton loading */
  const [loading] = useState(false);

  const paginatedTests = tests.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleView(test: MockTest) {
    if (test.locked) {
      toast.error("This test is locked. Upgrade to Premium.");
      return;
    }

    toast.success(`Opening ${test.name}`);
    router.push(`/mock-tests/${test.id}`);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead className="sticky top-0 z-10 bg-muted">
          <tr className="border-b border-border">
            <TableHead>Test Name</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Attempts</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </tr>
        </thead>

        <tbody>
          {loading
            ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <SkeletonRow key={i} />
              ))
            : paginatedTests.map((test, index) => (
                <tr
                  key={test.id}
                  className={cn(
                    "border-b border-border transition-colors",
                    index % 2 === 0 && "bg-background",
                    "hover:bg-muted/60"
                  )}
                >
                  {/* Test Name */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{test.name}</span>
                      <AccessBadge access={test.access} />
                    </div>

                    {test.lastAttempt && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Last attempt: {test.lastAttempt}
                      </p>
                    )}
                  </td>

                  {/* Duration */}
                  <td className="px-6 py-4 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {test.duration}
                    </div>
                  </td>

                  {/* Score */}
                  <td className="px-6 py-4">
                    {test.score !== "-" ? (
                      <div className="flex items-center gap-2 font-semibold text-primary">
                        <Trophy className="h-4 w-4" />
                        {test.score}
                        {test.scorePercent && (
                          <span className="text-xs text-muted-foreground">
                            ({test.scorePercent}%)
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium",
                        statusStyles[test.status]
                      )}
                    >
                      {statusIcons[test.status]}
                      {test.status}
                    </span>
                  </td>

                  {/* Attempts */}
                  <td className="px-6 py-4 text-muted-foreground">
                    {test.attempts}
                  </td>

                  {/* Action */}
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleView(test)}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 transition",
                        test.locked
                          ? "cursor-not-allowed text-muted-foreground"
                          : "hover:bg-muted"
                      )}
                    >
                      {test.locked ? (
                        <>
                          <Lock className="h-4 w-4" />
                          Locked
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4" />
                          View
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex items-center justify-between px-6 py-3">
        <p className="text-xs text-muted-foreground">
          Page {page} of {Math.ceil(tests.length / PAGE_SIZE)}
        </p>

        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-md border border-border px-3 py-1 text-xs disabled:opacity-50 hover:bg-muted"
          >
            Prev
          </button>
          <button
            onClick={() =>
              setPage((p) =>
                Math.min(p + 1, Math.ceil(tests.length / PAGE_SIZE))
              )
            }
            disabled={page * PAGE_SIZE >= tests.length}
            className="rounded-md border border-border px-3 py-1 text-xs disabled:opacity-50 hover:bg-muted"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
function SkeletonRow() {
  return (
    <tr className="border-b border-border">
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 w-full animate-pulse rounded-md bg-muted" />
        </td>
      ))}
    </tr>
  );
}
function AccessBadge({ access }: { access: AccessType }) {
  if (access === "VIP") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
        <Crown className="h-3 w-3" />
        PREMIUM
      </span>
    );
  }

  return (
    <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
      FREE
    </span>
  );
}
