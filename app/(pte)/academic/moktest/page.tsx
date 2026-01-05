import { MockTestTable } from "@/components/pte/mock-test/moktest-table";

export function MockTestPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            PTE Academic Practice
          </h1>
          <p className="text-muted-foreground">
            Full-length mock tests & section-wise practice
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Tests" value="12" />
        <StatCard title="Completed" value="4" />
        <StatCard title="In Progress" value="1" />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <MockTestTable />
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="mt-2 text-3xl font-bold text-primary">{value}</p>
    </div>
  );
}
