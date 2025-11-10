"use client"

import { AppSidebar } from "@/components/layout/app-sidebar"
import { SiteHeader } from "@/components/layout/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { FinancialGraph } from "@/components/ui/financial-graph"
import type { FinancialGraphSeries } from "@/components/ui/financial-graph"

export const iframeHeight = "800px"

export const description = "A sidebar with a header and a search form."

const demoFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
})

const demoDateFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
})

const demoSeries: FinancialGraphSeries[] = [
  { key: "primaryValue", label: "Asset A", axis: "left" },
  { key: "secondaryValue", label: "Asset B", axis: "right" },
]

const demoData = [
  { time: "2025-01-01T00:00:00Z", primaryValue: 2450.12, secondaryValue: 132.45 },
  { time: "2025-01-08T00:00:00Z", primaryValue: 2380.34, secondaryValue: 136.8 },
  { time: "2025-01-15T00:00:00Z", primaryValue: 2498.92, secondaryValue: 140.12 },
  { time: "2025-01-22T00:00:00Z", primaryValue: 2566.48, secondaryValue: 142.75 },
  { time: "2025-01-29T00:00:00Z", primaryValue: 2521.87, secondaryValue: 138.64 },
  { time: "2025-02-05T00:00:00Z", primaryValue: 2602.56, secondaryValue: 144.88 },
  { time: "2025-02-12T00:00:00Z", primaryValue: 2688.9, secondaryValue: 147.23 },
  { time: "2025-02-19T00:00:00Z", primaryValue: 2714.22, secondaryValue: 151.67 },
  { time: "2025-02-26T00:00:00Z", primaryValue: 2660.71, secondaryValue: 149.12 },
  { time: "2025-03-05T00:00:00Z", primaryValue: 2735.18, secondaryValue: 153.44 },
  { time: "2025-03-12T00:00:00Z", primaryValue: 2792.03, secondaryValue: 156.03 },
  { time: "2025-03-19T00:00:00Z", primaryValue: 2856.41, secondaryValue: 159.8 },
]

export default function Page() {
  return (


      <div className="w-full p-16">
        <FinancialGraph
          data={demoData}
          series={demoSeries}
          title="Portfolio Comparison"
          description="Track two asset prices side by side and scrub across the timeline."
          valueFormatter={(value) => demoFormatter.format(value ?? 0)}
          timeFormatter={(value) =>
            typeof value === "string"
              ? demoDateFormatter.format(new Date(value))
              : value instanceof Date
                ? demoDateFormatter.format(value)
                : demoDateFormatter.format(new Date(Number(value)))
          }
        />
      </div>

  )
}
