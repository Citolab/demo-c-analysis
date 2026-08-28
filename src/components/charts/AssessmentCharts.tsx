import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { chartColors } from "@/lib/colors"

const tooltipStyle = {
  borderRadius: "8px",
  border: "1px solid var(--border)",
  background: "var(--card)",
}

function getVisibleTickIndices(count: number, maxVisible = 12): Set<number> {
  if (count <= maxVisible) {
    return new Set(Array.from({ length: count }, (_, index) => index))
  }

  const indices = new Set<number>([0, count - 1])
  const step = Math.ceil((count - 1) / (maxVisible - 1))
  for (let index = step; index < count - 1; index += step) {
    indices.add(index)
  }
  return indices
}

function PValueXAxisTick({
  x,
  y,
  payload,
  index,
  visibleTicks,
}: {
  x?: string | number
  y?: string | number
  payload?: { value: string }
  index: number
  visibleTicks: Set<number>
}) {
  const tickX = typeof x === "number" ? x : Number(x)
  const tickY = typeof y === "number" ? y : Number(y)

  if (!Number.isFinite(tickX) || !Number.isFinite(tickY) || !payload || !visibleTicks.has(index)) {
    return null
  }

  return (
    <text
      x={tickX}
      y={tickY + 16}
      textAnchor="middle"
      fontSize={11}
      fill="var(--muted-foreground)"
    >
      {payload.value}
    </text>
  )
}

export function PValueChart({
  items,
  series,
  averages,
  yAxisLabel,
  averageLabel,
  onItemClick,
}: {
  items: string[]
  series: { name: string; color: string; values: number[] }[]
  averages: number[]
  yAxisLabel: string
  averageLabel: string
  onItemClick: (label: string) => void
}) {
  const data = items.map((label, index) => {
    const row: Record<string, string | number> = { label }
    for (const entry of series) {
      row[entry.name] = entry.values[index]
    }
    return row
  })
  const visibleTicks = getVisibleTickIndices(items.length)

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 16, right: 16, left: 4, bottom: 12 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="label"
          interval={0}
          height={40}
          tickLine={false}
          axisLine={{ stroke: "var(--border)" }}
          tick={(props) => (
            <PValueXAxisTick {...props} visibleTicks={visibleTicks} />
          )}
        />
        <YAxis domain={[0, 100]} tickCount={5} label={{ value: yAxisLabel, angle: -90, position: "insideLeft" }} />
        <Tooltip
          contentStyle={tooltipStyle}
          labelFormatter={(label) => String(label)}
          formatter={(value) => [`${value}%`, ""]}
        />
        {series.length > 1 ? <Legend /> : null}
        {averages.map((average, index) => (
          <ReferenceLine
            key={`avg-${index}`}
            y={average}
            stroke={series[index]?.color}
            strokeDasharray="4 4"
            label={{
              value: `${averageLabel}: ${average}%`,
              position: "insideTopLeft",
              fill: series[index]?.color,
              fontSize: 11,
            }}
          />
        ))}
        {series.map((entry) => (
          <Line
            key={entry.name}
            type="monotone"
            dataKey={entry.name}
            stroke={entry.color}
            strokeWidth={0}
            dot={(props) => {
              const { cx, cy, payload } = props
              if (cx == null || cy == null) return null
              return (
                <circle
                  cx={cx}
                  cy={cy}
                  r={6}
                  fill={entry.color}
                  className="cursor-pointer"
                  onClick={() => onItemClick(String(payload.label))}
                />
              )
            }}
            activeDot={{ r: 8 }}
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

export function StudentScoreChart({
  chartData,
  series,
  referenceLines,
  cutOffScore,
  xAxisLabel,
  yAxisLabel,
  averageLabel,
  cutOffLabel,
}: {
  chartData: Record<string, string | number>[]
  series: { name: string; color: string }[]
  referenceLines: { name: string; color: string; average: number }[]
  cutOffScore: number | null
  xAxisLabel: string
  yAxisLabel: string
  averageLabel: string
  cutOffLabel: string
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 24, right: 16, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="score" label={{ value: xAxisLabel, position: "insideBottom", offset: -2 }} />
        <YAxis label={{ value: yAxisLabel, angle: -90, position: "insideLeft" }} />
        <Tooltip contentStyle={tooltipStyle} />
        {series.length > 1 ? <Legend /> : null}
        {referenceLines.map((line, index) => (
          <ReferenceLine
            key={line.name}
            x={String(Math.round(line.average))}
            stroke={line.color}
            strokeDasharray="4 4"
            label={{
              value: `${averageLabel}: ${line.average}`,
              position: "insideTopLeft",
              fill: line.color,
              fontSize: 11,
              dy: index * 18,
            }}
          />
        ))}
        {cutOffScore !== null ? (
          <ReferenceLine
            x={String(cutOffScore)}
            stroke="#111827"
            strokeDasharray="4 4"
            label={{
              value: `${cutOffLabel}: ${cutOffScore}`,
              position: "insideTopRight",
              fill: "#111827",
              fontSize: 11,
            }}
          />
        ) : null}
        {series.map((entry) => (
          <Bar key={entry.name} dataKey={entry.name} fill={entry.color} radius={[4, 4, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

export function PercentBarChart({
  data,
}: {
  data: { name: string; value: number; color: string }[]
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 24, right: 16, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" />
        <YAxis hide domain={[0, 100]} />
        <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value}%`, ""]} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
          <LabelList dataKey="value" position="top" formatter={(value) => `${value}%`} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function GroupedBarChart({
  labels,
  series,
  yAxisLabel,
  xAxisLabel,
}: {
  labels: string[]
  series: { name: string; color: string; values: number[] }[]
  yAxisLabel?: string
  xAxisLabel?: string
}) {
  const data = labels.map((label, index) => {
    const row: Record<string, string | number> = { label }
    for (const entry of series) {
      row[entry.name] = entry.values[index] ?? 0
    }
    return row
  })

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 16, right: 16, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="label"
          label={xAxisLabel ? { value: xAxisLabel, position: "insideBottom", offset: -2 } : undefined}
        />
        <YAxis
          allowDecimals={false}
          label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: "insideLeft" } : undefined}
        />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend />
        {series.map((entry) => (
          <Bar key={entry.name} dataKey={entry.name} fill={entry.color} radius={[4, 4, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

export function ResponseDistributionChart({
  labels,
  series,
  itemKey,
  yAxisLabel,
}: {
  labels: string[]
  series: { name: string; color: string; values: number[] }[]
  itemKey: string
  yAxisLabel: string
}) {
  const data = labels.map((label, index) => {
    const row: Record<string, string | number> = { label }
    for (const entry of series) {
      row[entry.name] = entry.values[index] ?? 0
    }
    return row
  })

  const singleSeries = series.length === 1

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 16, right: 16, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" />
        <YAxis allowDecimals={false} label={{ value: yAxisLabel, angle: -90, position: "insideLeft" }} />
        <Tooltip contentStyle={tooltipStyle} />
        {!singleSeries ? <Legend /> : null}
        {singleSeries ? (
          <Bar dataKey={series[0].name} radius={[4, 4, 0, 0]}>
            {labels.map((label) => (
              <Cell
                key={label}
                fill={itemKey.includes(label) ? chartColors.correct : chartColors.incorrect}
              />
            ))}
          </Bar>
        ) : (
          series.map((entry) => (
            <Bar key={entry.name} dataKey={entry.name} fill={entry.color} radius={[4, 4, 0, 0]} />
          ))
        )}
      </BarChart>
    </ResponsiveContainer>
  )
}

export function DistractorPlotChart({
  series,
  xAxisLabel,
  yAxisLabel,
}: {
  series: {
    name: string
    color: string
    lines: {
      alternative: string
      isKey: boolean
      points: { group: string; value: number }[]
    }[]
  }[]
  xAxisLabel: string
  yAxisLabel: string
}) {
  const active = series[0]
  if (!active?.lines[0]?.points.length) return null

  const chartData = active.lines[0].points.map((point) => {
    const row: Record<string, string | number> = { group: point.group }
    for (const line of active.lines) {
      const match = line.points.find((entry) => entry.group === point.group)
      row[line.alternative] = match?.value ?? 0
    }
    return row
  })

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 16, right: 16, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="group"
          type="category"
          label={{ value: xAxisLabel, position: "insideBottom", offset: -2 }}
        />
        <YAxis
          domain={[0, 100]}
          label={{ value: yAxisLabel, angle: -90, position: "insideLeft" }}
        />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend />
        {active.lines.map((line) => (
          <Line
            key={line.alternative}
            type="monotone"
            dataKey={line.alternative}
            stroke={line.isKey ? chartColors.correct : chartColors.incorrect}
            dot={{ r: 3 }}
            strokeWidth={2}
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

export function MiniResponseSparkline({
  labels,
  values,
  itemKey,
}: {
  labels: string[]
  values: number[]
  itemKey: string
}) {
  const data = labels.map((label, index) => ({ label, value: values[index] }))

  return (
    <ResponsiveContainer width="100%" height={36}>
      <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <XAxis hide dataKey="label" />
        <YAxis hide />
        <Bar dataKey="value" isAnimationActive={false}>
          {labels.map((label) => (
            <Cell
              key={label}
              fill={itemKey.includes(label) ? chartColors.correct : chartColors.incorrect}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
