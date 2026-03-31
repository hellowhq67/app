import { MetricsGrid } from '@/components/admin/status/metrics-grid'
import { HealthCards } from '@/components/admin/status/health-cards'
import { mockHealthServices } from '@/lib/admin/mock-data'

export default function AdminStatusPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">App Status</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Monitor service health, uptime, and system metrics.
        </p>
      </div>
      <MetricsGrid />
      <HealthCards services={mockHealthServices} />
    </div>
  )
}
