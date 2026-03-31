'use client'

import { useState } from 'react'
import {
  Database,
  Brain,
  Mic,
  HardDrive,
  Mail,
  Zap,
  RefreshCw,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { HealthService, HealthStatus } from '@/lib/admin/types'

const iconMap: Record<string, React.ElementType> = {
  Database,
  Brain,
  Mic,
  HardDrive,
  Mail,
  Zap,
}

const statusDot: Record<HealthStatus, string> = {
  healthy: 'bg-emerald-500',
  degraded: 'bg-amber-500',
  down: 'bg-destructive',
}

const statusLabel: Record<HealthStatus, string> = {
  healthy: 'Healthy',
  degraded: 'Degraded',
  down: 'Down',
}

const statusTextColor: Record<HealthStatus, string> = {
  healthy: 'text-emerald-600 dark:text-emerald-400',
  degraded: 'text-amber-600 dark:text-amber-400',
  down: 'text-destructive',
}

export function HealthCards({ services: initialServices }: { services: HealthService[] }) {
  const [services, setServices] = useState(initialServices)
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = () => {
    setRefreshing(true)
    // Simulate a refresh — update lastChecked
    setTimeout(() => {
      setServices((prev) =>
        prev.map((s) => ({ ...s, lastChecked: new Date().toISOString() }))
      )
      setRefreshing(false)
    }, 800)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Service Health</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="h-8 gap-1.5 text-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {services.map((svc) => {
          const Icon = iconMap[svc.icon] ?? Database
          return (
            <Card key={svc.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{svc.name}</p>
                      <p className="text-xs text-muted-foreground">{svc.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${statusDot[svc.status]}`} />
                    <span className={`text-xs font-medium ${statusTextColor[svc.status]}`}>
                      {statusLabel[svc.status]}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Response Time</p>
                    <p className="text-sm font-medium text-foreground">
                      {svc.responseMs < 1000 ? `${svc.responseMs}ms` : `${(svc.responseMs / 1000).toFixed(1)}s`}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Uptime (30d)</p>
                    <p className="text-sm font-medium text-foreground">{svc.uptimePercent}%</p>
                  </div>
                </div>

                <p className="mt-2 text-xs text-muted-foreground">
                  Checked {new Date(svc.lastChecked).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
