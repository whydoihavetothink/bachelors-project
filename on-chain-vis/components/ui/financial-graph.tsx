"use client"

import * as React from "react"
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Brush,
  type TooltipProps,
} from "recharts"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Primitive = string | number | Date

export type FinancialGraphDatum = Record<string, Primitive | number | null | undefined>

type AxisId = "left" | "right"

export type FinancialGraphSeries = {
  key: string
  label: string
  color?: string
  axis?: AxisId
}

export interface FinancialGraphProps<T extends FinancialGraphDatum = FinancialGraphDatum> {
  data: T[]
  series: FinancialGraphSeries[]
  /**
   * Key from the datum representing the horizontal axis. Defaults to `time`.
   */
  timeKey?: keyof T & string
  /**
   * Height of the chart area. Defaults to 360.
   */
  height?: number
  /**
   * Optional title rendered above the chart.
   */
  title?: string
  /**
   * Optional short description rendered alongside the title.
   */
  description?: string
  /**
   * Format function for tooltip values and Y-axis ticks.
   */
  valueFormatter?: (value: number | null | undefined) => string
  /**
   * Format function for tooltip labels and X-axis ticks.
   */
  timeFormatter?: (value: Primitive, index?: number) => string
  className?: string
  /**
   * Show or hide the horizontal brush used for scrubbing.
   * Enabled by default.
   */
  showBrush?: boolean
  /**
   * Whether to display a Cartesian grid. Enabled by default.
   */
  showGrid?: boolean
}

type NormalizedDatum<T extends FinancialGraphDatum> = T & {
  __xValue: number
  __xRaw: Primitive
}

interface FinancialGraphHeaderProps {
  title?: string
  description?: string
  series: FinancialGraphSeries[]
  visibleSeries: Record<string, boolean>
  onToggle: (key: string) => void
}


function FinancialGraphHeader({
  title,
  description,
  series,
  visibleSeries,
  onToggle,
}: FinancialGraphHeaderProps) {
  if (!title && !description && series.length === 0) {
    return null
  }

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          {title ? <h3 className="text-sm font-semibold tracking-tight text-foreground">{title}</h3> : null}
          {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
        </div>
        <div className="flex items-center gap-2">
          {series.map((serie) => {
            const isActive = visibleSeries[serie.key] !== false
            return (
              <Button
                key={serie.key}
                size="sm"
                variant={isActive ? "outline" : "ghost"}
                className={cn(
                  "h-8 gap-2 border-border/60 bg-background/30 transition-opacity",
                  !isActive && "opacity-60"
                )}
                onClick={() => onToggle(serie.key)}
              >
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: serie.color ?? "var(--chart-1)" }}
                />
                <span className="text-xs font-medium">{serie.label}</span>
              </Button>
            )
          })}
        </div>
      </div>

      <div className="h-px w-full bg-border/60" />
    </>
  )
}


const fallbackNumberFormatter = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const defaultValueFormatter = (value: number | null | undefined) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—"
  }

  try {
    return fallbackNumberFormatter.format(value)
  } catch {
    return `${value}`
  }
}

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

const defaultTimeFormatter = (value: Primitive) => {
  if (value instanceof Date) {
    return dateTimeFormatter.format(value)
  }

  if (typeof value === "number") {
    if (Number.isFinite(value) && value > 10_000) {
      return dateTimeFormatter.format(new Date(value))
    }
    return `${value}`
  }

  if (typeof value === "string") {
    const parsed = Date.parse(value)
    if (!Number.isNaN(parsed)) {
      return dateTimeFormatter.format(new Date(parsed))
    }
    return value
  }

  return `${value}`
}

export function FinancialGraph<T extends FinancialGraphDatum = FinancialGraphDatum>({
  data,
  series,
  timeKey = "time" as keyof T & string,
  height = 360,
  title,
  description,
  valueFormatter = defaultValueFormatter,
  timeFormatter,
  className,
  showBrush = true,
  showGrid = true,
}: FinancialGraphProps<T>) {
  const resolvedSeries = React.useMemo(() => {
    return series.slice(0, 2).map((entry, index) => ({
      ...entry,
      color: entry.color ?? `var(--chart-${Math.min(index + 1, 5)})`,
      axis: entry.axis ?? (index === 0 ? "left" : "right"),
    }))
  }, [series])

  const [visibleSeries, setVisibleSeries] = React.useState<Record<string, boolean>>(() => {
    return resolvedSeries.reduce<Record<string, boolean>>((acc, item) => {
      acc[item.key] = true
      return acc
    }, {})
  })

  const toggleSeries = React.useCallback((key: string) => {
    setVisibleSeries((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }, [])

  const normalizedData = React.useMemo(() => {
    return data.map((item, index) => {
      const raw = (item?.[timeKey] as Primitive | undefined) ?? index

      const numeric = (() => {
        if (raw instanceof Date) {
          return raw.getTime()
        }
        if (typeof raw === "number") {
          return raw
        }
        if (typeof raw === "string") {
          const parsed = Date.parse(raw)
          if (!Number.isNaN(parsed)) {
            return parsed
          }
        }
        return index
      })()

      return {
        ...item,
        __xValue: Number.isFinite(numeric) ? numeric : index,
        __xRaw: raw,
      }
    }) as NormalizedDatum<T>[]
  }, [data, timeKey])

  const xValueLookup = React.useMemo(() => {
    const map = new Map<number, Primitive>()
    for (const entry of normalizedData) {
      map.set(entry.__xValue, entry.__xRaw)
    }
    return map
  }, [normalizedData])

  const resolveTimeLabel = React.useCallback(
    (value: number): string => {
      const raw = xValueLookup.get(value)
      const formatter = timeFormatter ?? defaultTimeFormatter
      return formatter(raw ?? value, normalizedData.findIndex((d) => d.__xValue === value))
    },
    [normalizedData, timeFormatter, xValueLookup]
  )

  const tooltipRenderer = React.useCallback(
    ({ active, label, payload }: TooltipProps<number, string>) => {
      if (!active || !payload || payload.length === 0) return null

      const labelContent = typeof label === "number" ? resolveTimeLabel(label) : `${label}`

      return (
        <div className="min-w-[12rem] rounded-md border border-border/60 bg-popover/80 px-3 py-2 text-xs shadow-sm backdrop-blur">
          <div className="font-medium text-foreground">{labelContent}</div>
          <div className="mt-2 space-y-1">
            {payload
              .filter((entry) => entry.dataKey && visibleSeries[String(entry.dataKey)])
              .map((entry) => {
                const meta = resolvedSeries.find((s) => s.key === entry.dataKey)
                return (
                  <div key={entry.dataKey} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="size-2.5 rounded-full"
                        style={{ backgroundColor: entry.color ?? meta?.color ?? "var(--foreground)" }}
                      />
                      <span className="text-muted-foreground">
                        {meta?.label ?? entry.name ?? entry.dataKey}
                      </span>
                    </div>
                    <span className="font-medium text-foreground">
                      {valueFormatter(entry.value as number | null | undefined)}
                    </span>
                  </div>
                )
              })}
          </div>
        </div>
      )
    },
    [resolveTimeLabel, resolvedSeries, valueFormatter, visibleSeries]
  )

  const showHeader = Boolean(title || description || resolvedSeries.length)

  const axisGroups = React.useMemo(() => {
    return {
      left: resolvedSeries.filter((serie) => (serie.axis ?? "left") === "left"),
      right: resolvedSeries.filter((serie) => (serie.axis ?? "left") === "right"),
    }
  }, [resolvedSeries])

  const showLeftAxis = axisGroups.left.some((serie) => visibleSeries[serie.key] !== false)
  const showRightAxis = axisGroups.right.some((serie) => visibleSeries[serie.key] !== false)

  const yAxisIds: {id: "left" | "right", show: boolean}[] = [{id: "left", show: showLeftAxis}, {id: "right", show: showRightAxis}]

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-xl border border-border/60 bg-card/60 p-4 shadow-sm backdrop-blur",
        className
      )}
    >
      {showHeader ? (
        <FinancialGraphHeader
          title={title}
          description={description}
          series={resolvedSeries}
          visibleSeries={visibleSeries}
          onToggle={toggleSeries}
        />
      ) : null}

      <div className="w-full overflow-hidden">
        <ResponsiveContainer width="100%" height={height}>
          <LineChart
            data={normalizedData}
            margin={{
              top: 8,
              right: showRightAxis ? 48 : 16,
              bottom: showBrush ? 32 : 8,
              left: showLeftAxis ? 16 : 8,
            }}
          >
            {showGrid ? (
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" opacity={0.6} />
            ) : null}

            <XAxis
              dataKey="__xValue"
              type="number"
              domain={["auto", "auto"]}
              tickFormatter={(value) => resolveTimeLabel(Number(value))}
              tickLine={false}
              axisLine={false}
              stroke="var(--muted-foreground)"
              tick={{ fontSize: 12 }}
            />
            {yAxisIds.map(({ id, show }) => (
              <YAxis
                key={id}
                yAxisId={id}
                orientation={id}
                stroke="var(--muted-foreground)"
                tickFormatter={(value) =>
                  valueFormatter(typeof value === "number" ? value : Number(value))
                }
                tickLine={false}
                axisLine={false}
                width={show ? 60 : 0}
                tick={{ fontSize: 12 }}
                hide={!show}
              />
            ))}

            <Tooltip
              content={tooltipRenderer}
              cursor={{ stroke: "var(--muted-foreground)", strokeDasharray: "4 4", strokeWidth: 1 }}
              isAnimationActive={false}
            />
            {resolvedSeries.map((serie) => (
              <Line
                key={serie.key}
                type="monotone"
                dataKey={serie.key}
                name={serie.label}
                dot={false}
                strokeWidth={2}
                stroke={serie.color ?? "var(--chart-1)"}
                hide={visibleSeries[serie.key] === false}
                isAnimationActive={false}
                yAxisId={serie.axis ?? "left"}
                connectNulls
                activeDot={{ r: 4 }}
              />
            ))}
            {showBrush ? (
              <Brush
                dataKey="__xValue"
                height={24}
                travellerWidth={8}
                stroke="var(--muted-foreground)"
                fill="var(--muted)"
                alwaysShowText={false}
                tickFormatter={(value) => resolveTimeLabel(Number(value))}
              />
            ) : null}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}


