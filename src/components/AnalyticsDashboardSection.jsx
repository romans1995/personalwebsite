import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  BarChart3,
  Clock3,
  ExternalLink,
  Eye,
  Gauge,
  Link2,
  MousePointerClick,
  RefreshCw,
  TrendingUp,
  Users,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { listAnalyticsEvents } from '../services/analyticsService'

const MotionDiv = motion.div

const FILTERS = [
  { id: 'today', label: 'Today', days: 1, previousLabel: 'Compared with yesterday' },
  { id: '7d', label: '7d', days: 7, previousLabel: 'Compared with the previous 7 days' },
  { id: '30d', label: '30d', days: 30, previousLabel: 'Compared with the previous 30 days' },
  { id: 'all', label: 'All time', days: null, previousLabel: 'Full history' },
]

const CLICK_EVENT_TYPES = [
  'hero_cta_click',
  'project_click',
  'contact_click',
  'social_click',
  'linkedin_post_click',
]

const EVENT_META = {
  page_visit: { label: 'Page visit', shortLabel: 'Visits', color: '#38bdf8' },
  hero_cta_click: { label: 'Hero CTA', shortLabel: 'Hero CTA', color: '#60a5fa' },
  project_click: { label: 'Project click', shortLabel: 'Projects', color: '#34d399' },
  contact_click: { label: 'Contact click', shortLabel: 'Contact', color: '#f59e0b' },
  social_click: { label: 'Social click', shortLabel: 'Social', color: '#a78bfa' },
  linkedin_post_click: { label: 'LinkedIn post', shortLabel: 'LinkedIn', color: '#22d3ee' },
  admin_login_view: { label: 'Admin login view', shortLabel: 'Admin', color: '#f472b6' },
}

const KPI_GRADIENTS = {
  sky: 'from-sky-500/20 via-slate-950 to-slate-950',
  emerald: 'from-emerald-500/18 via-slate-950 to-slate-950',
  violet: 'from-violet-500/18 via-slate-950 to-slate-950',
  amber: 'from-amber-500/20 via-slate-950 to-slate-950',
  cyan: 'from-cyan-500/18 via-slate-950 to-slate-950',
  blue: 'from-blue-500/18 via-slate-950 to-slate-950',
}

function getRangeStart(days) {
  if (!days) return null
  const nextDate = new Date()
  nextDate.setHours(0, 0, 0, 0)
  nextDate.setDate(nextDate.getDate() - (days - 1))
  return nextDate
}

function filterEventsByDays(events, days) {
  const start = getRangeStart(days)
  if (!start) return events
  return events.filter((event) => event.createdAt && event.createdAt >= start)
}

function filterEventsByRange(events, startDate, endDate) {
  return events.filter((event) => {
    if (!event.createdAt) return false
    if (startDate && event.createdAt < startDate) return false
    if (endDate && event.createdAt >= endDate) return false
    return true
  })
}

function getPreviousPeriodEvents(events, days) {
  if (!days) return []
  const currentStart = getRangeStart(days)
  if (!currentStart) return []

  const previousStart = new Date(currentStart)
  previousStart.setDate(previousStart.getDate() - days)

  return filterEventsByRange(events, previousStart, currentStart)
}

function countUniqueSessionIds(events, startDate) {
  const activeSessions = new Set()

  events.forEach((event) => {
    if (!event.createdAt || event.createdAt < startDate || !event.sessionId) return
    activeSessions.add(event.sessionId)
  })

  return activeSessions.size
}

function formatCompactNumber(value) {
  return new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: value < 10 ? 1 : 0,
  }).format(value)
}

function formatTimestamp(value) {
  if (!value) return 'Pending'
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(value)
}

function getTopEntry(entries) {
  return entries[0] || null
}

function buildRankings(events, selector) {
  const counts = new Map()

  events.forEach((event) => {
    const key = selector(event)
    if (!key) return
    counts.set(key, (counts.get(key) || 0) + 1)
  })

  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((left, right) => right.count - left.count)
}

function buildActivitySeries(events, filterId) {
  const buckets = new Map()
  const isToday = filterId === 'today'

  events.forEach((event) => {
    if (!event.createdAt) return

    const bucketDate = new Date(event.createdAt)
    if (isToday) {
      bucketDate.setMinutes(0, 0, 0)
    } else {
      bucketDate.setHours(0, 0, 0, 0)
    }

    const key = bucketDate.toISOString()
    if (!buckets.has(key)) {
      buckets.set(key, {
        key,
        label: isToday
          ? new Intl.DateTimeFormat('en', { hour: 'numeric' }).format(bucketDate)
          : new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(bucketDate),
        visits: 0,
        clicks: 0,
      })
    }

    const bucket = buckets.get(key)
    if (event.type === 'page_visit') bucket.visits += 1
    if (CLICK_EVENT_TYPES.includes(event.type)) bucket.clicks += 1
  })

  return Array.from(buckets.values()).sort((left, right) => left.key.localeCompare(right.key))
}

function buildEventTypeSeries(events) {
  return CLICK_EVENT_TYPES.map((type) => ({
    type,
    count: events.filter((event) => event.type === type).length,
    fill: EVENT_META[type].color,
    label: EVENT_META[type].shortLabel,
  })).filter((item) => item.count > 0)
}

function buildPageSeries(events) {
  return buildRankings(
    events.filter((event) => event.type === 'page_visit'),
    (event) => event.page,
  ).slice(0, 6)
}

function computeDelta(currentValue, previousValue) {
  if (!previousValue && !currentValue) return { text: 'No change', tone: 'neutral' }
  if (!previousValue) return { text: 'New activity', tone: 'positive' }

  const change = ((currentValue - previousValue) / previousValue) * 100
  const rounded = Math.round(Math.abs(change))

  if (change > 0) return { text: `${rounded}% up`, tone: 'positive' }
  if (change < 0) return { text: `${rounded}% down`, tone: 'negative' }
  return { text: 'No change', tone: 'neutral' }
}

function getKpiTrendData(activitySeries, key) {
  const values = activitySeries.map((item) => item[key]).filter((value) => typeof value === 'number')
  if (values.length > 0) return values.slice(-8)
  return [0, 0, 0, 0]
}

function truncateLabel(value, maxLength = 42) {
  if (!value) return 'No data yet'
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}…` : value
}

function getEventTypeLabel(type) {
  return EVENT_META[type]?.label || type.replaceAll('_', ' ')
}

function getToneClasses(tone) {
  if (tone === 'positive') return 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20'
  if (tone === 'negative') return 'text-rose-300 bg-rose-500/10 border-rose-500/20'
  return 'text-slate-300 bg-white/[0.05] border-white/[0.08]'
}

function SparkBars({ values, colorClass }) {
  const maxValue = Math.max(...values, 1)

  return (
    <div className="flex h-12 items-end gap-1.5">
      {values.map((value, index) => {
        const height = Math.max(14, Math.round((value / maxValue) * 48))

        return (
          <div
            key={`${value}-${index}`}
            className={`w-full rounded-full ${colorClass} opacity-90`}
            style={{ height }}
          />
        )
      })}
    </div>
  )
}

function FilterSegment({ selectedFilter, onSelect }) {
  return (
    <div className="inline-flex rounded-2xl border border-white/[0.08] bg-slate-950/80 p-1 shadow-[0_14px_40px_rgba(2,6,23,0.4)]">
      {FILTERS.map((filter) => {
        const active = selectedFilter === filter.id

        return (
          <button
            key={filter.id}
            type="button"
            onClick={() => onSelect(filter.id)}
            className={`rounded-2xl px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] transition ${
              active
                ? 'bg-gradient-to-r from-sky-500/20 to-violet-500/20 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.06)]'
                : 'text-slate-500 hover:text-slate-200'
            }`}
          >
            {filter.label}
          </button>
        )
      })}
    </div>
  )
}

function MetricCard({
  title,
  value,
  icon,
  accent,
  hint,
  comparison,
  comparisonLabel,
  trendValues,
  sparkColor,
}) {
  const Icon = icon

  return (
    <MotionDiv
      layout
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={`group relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-gradient-to-br ${accent} p-5 shadow-[0_24px_80px_rgba(2,6,23,0.45)]`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_38%)] opacity-80" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300/80">{title}</p>
          <div className="mt-3 flex items-end gap-3">
            <p className="text-4xl font-semibold tracking-tight text-white sm:text-[2.7rem]">{value}</p>
            {comparison ? (
              <span className={`mb-1 inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${getToneClasses(comparison.tone)}`}>
                {comparison.text}
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-sm text-slate-300/80">{hint}</p>
          {comparisonLabel ? <p className="mt-1 text-xs text-slate-500">{comparisonLabel}</p> : null}
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/10 p-3 text-white shadow-[0_10px_30px_rgba(15,23,42,0.25)]">
          <Icon size={18} />
        </div>
      </div>

      <div className="relative mt-5">
        <SparkBars values={trendValues} colorClass={sparkColor} />
      </div>
    </MotionDiv>
  )
}

function SectionCard({ eyebrow, title, description, action, children, className = '' }) {
  return (
    <section className={`rounded-[30px] border border-white/[0.08] bg-white/[0.04] p-5 backdrop-blur-xl shadow-[0_18px_60px_rgba(2,6,23,0.35)] sm:p-6 ${className}`}>
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          {eyebrow ? <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-400">{eyebrow}</p> : null}
          <h2 className="mt-2 text-xl font-semibold text-white">{title}</h2>
          {description ? <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

function LoadingGrid() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-52 rounded-[30px] border border-white/[0.06] bg-white/[0.04]" />
      <div className="grid gap-4 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-52 rounded-[30px] border border-white/[0.06] bg-white/[0.04]" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,1fr)]">
        <div className="h-[430px] rounded-[30px] border border-white/[0.06] bg-white/[0.04]" />
        <div className="h-[430px] rounded-[30px] border border-white/[0.06] bg-white/[0.04]" />
      </div>
    </div>
  )
}

function EmptyPanel({ icon, title, description }) {
  const Icon = icon

  return (
    <div className="flex h-full min-h-48 flex-col items-center justify-center rounded-[24px] border border-dashed border-white/[0.1] bg-slate-950/50 px-6 py-10 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] text-sky-300">
        <Icon size={20} />
      </div>
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-slate-400">{description}</p>
    </div>
  )
}

function InsightTile({ icon, label, value, count, accent }) {
  const Icon = icon

  return (
    <div className={`rounded-[24px] border border-white/[0.08] bg-gradient-to-br ${accent} p-4`}>
      <div className="flex items-start gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/10 p-3 text-white">
          <Icon size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
          <p className="mt-2 truncate text-sm font-medium text-white">{truncateLabel(value, 48)}</p>
          <p className="mt-1 text-xs text-slate-500">{count ? `${count} tracked interactions` : 'Waiting for traffic'}</p>
        </div>
      </div>
    </div>
  )
}

function DashboardTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-2xl border border-white/[0.12] bg-slate-950/95 px-4 py-3 shadow-[0_18px_50px_rgba(2,6,23,0.6)]">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <div className="mt-3 space-y-2">
        {payload.map((item) => (
          <div key={item.dataKey} className="flex items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span>{item.name}</span>
            </div>
            <span className="font-medium text-white">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function LowDataTrendFallback({ points }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {points.map((point) => (
        <div key={point.key} className="rounded-[24px] border border-white/[0.08] bg-slate-950/55 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{point.label}</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-sky-500/10 bg-sky-500/10 p-3">
              <p className="text-[11px] uppercase tracking-[0.16em] text-sky-200/75">Visits</p>
              <p className="mt-2 text-2xl font-semibold text-white">{point.visits}</p>
            </div>
            <div className="rounded-2xl border border-violet-500/10 bg-violet-500/10 p-3">
              <p className="text-[11px] uppercase tracking-[0.16em] text-violet-200/75">Clicks</p>
              <p className="mt-2 text-2xl font-semibold text-white">{point.clicks}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function RankedList({ items, emptyText, badgeTone = 'sky' }) {
  const badgeStyles = {
    sky: 'bg-sky-500/10 text-sky-300',
    violet: 'bg-violet-500/10 text-violet-300',
    amber: 'bg-amber-500/10 text-amber-300',
    emerald: 'bg-emerald-500/10 text-emerald-300',
  }

  if (items.length === 0) {
    return <p className="text-sm text-slate-400">{emptyText}</p>
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={`${item.label}-${index}`} className="flex items-center justify-between gap-4 rounded-[22px] border border-white/[0.06] bg-slate-950/55 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{truncateLabel(item.label, 54)}</p>
            <p className="mt-1 text-xs text-slate-500">Rank #{index + 1}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeStyles[badgeTone]}`}>{item.count}</span>
        </div>
      ))}
    </div>
  )
}

function EventPill({ type }) {
  const meta = EVENT_META[type] || EVENT_META.page_visit

  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]"
      style={{
        borderColor: `${meta.color}33`,
        backgroundColor: `${meta.color}1a`,
        color: meta.color,
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
      {meta.shortLabel}
    </span>
  )
}

function AnalyticsDashboardSection({ firebaseEnabled }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('7d')
  const [updatedAt, setUpdatedAt] = useState(null)

  const loadEvents = useCallback(async () => {
    if (!firebaseEnabled) {
      setEvents([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')

    try {
      const nextEvents = await listAnalyticsEvents()
      setEvents(nextEvents)
      setUpdatedAt(new Date())
    } catch (nextError) {
      setError(nextError.message || 'Unable to load analytics data.')
    } finally {
      setLoading(false)
    }
  }, [firebaseEnabled])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  useEffect(() => {
    if (!firebaseEnabled) return undefined

    const interval = window.setInterval(() => {
      loadEvents()
    }, 60000)

    return () => window.clearInterval(interval)
  }, [firebaseEnabled, loadEvents])

  const activeFilter = FILTERS.find((item) => item.id === selectedFilter) || FILTERS[1]

  const filteredEvents = useMemo(
    () => filterEventsByDays(events, activeFilter.days),
    [activeFilter.days, events],
  )

  const analytics = useMemo(() => {
    const now = new Date()
    const todayEvents = filterEventsByDays(events, 1)
    const sevenDayEvents = filterEventsByDays(events, 7)
    const thirtyDayEvents = filterEventsByDays(events, 30)
    const previousTodayEvents = getPreviousPeriodEvents(events, 1)
    const previousSevenDayEvents = getPreviousPeriodEvents(events, 7)
    const previousThirtyDayEvents = getPreviousPeriodEvents(events, 30)
    const clickEvents = events.filter((event) => CLICK_EVENT_TYPES.includes(event.type))
    const filteredClickEvents = filteredEvents.filter((event) => CLICK_EVENT_TYPES.includes(event.type))
    const activeUsers = countUniqueSessionIds(events, new Date(now.getTime() - 5 * 60 * 1000))

    const topProject = getTopEntry(
      buildRankings(filteredEvents.filter((event) => event.type === 'project_click'), (event) => event.projectTitle),
    )
    const topLink = getTopEntry(buildRankings(filteredClickEvents, (event) => event.destination))
    const topContact = getTopEntry(
      buildRankings(filteredEvents.filter((event) => event.type === 'contact_click'), (event) => event.label || event.metadata?.action),
    )
    const topSocial = getTopEntry(
      buildRankings(filteredEvents.filter((event) => event.type === 'social_click'), (event) => event.label),
    )

    const topContactMethods = buildRankings(
      filteredEvents.filter((event) => event.type === 'contact_click'),
      (event) => event.label || event.metadata?.action,
    ).slice(0, 4)

    const topSocialMethods = buildRankings(
      filteredEvents.filter((event) => event.type === 'social_click'),
      (event) => event.label,
    ).slice(0, 4)

    const activitySeries = buildActivitySeries(filteredEvents, activeFilter.id)

    return {
      visitsToday: todayEvents.filter((event) => event.type === 'page_visit').length,
      visits7d: sevenDayEvents.filter((event) => event.type === 'page_visit').length,
      visits30d: thirtyDayEvents.filter((event) => event.type === 'page_visit').length,
      previousVisitsToday: previousTodayEvents.filter((event) => event.type === 'page_visit').length,
      previousVisits7d: previousSevenDayEvents.filter((event) => event.type === 'page_visit').length,
      previousVisits30d: previousThirtyDayEvents.filter((event) => event.type === 'page_visit').length,
      totalTrackedClicks: clickEvents.length,
      linkedinClicks: events.filter((event) => event.type === 'linkedin_post_click').length,
      activeUsers,
      topProject,
      topLink,
      topContact,
      topSocial,
      topContactMethods,
      topSocialMethods,
      activitySeries,
      pageSeries: buildPageSeries(filteredEvents),
      clickTypeSeries: buildEventTypeSeries(filteredEvents),
      recentEvents: filteredEvents.slice(0, 10),
      topProjects: buildRankings(filteredEvents.filter((event) => event.type === 'project_click'), (event) => event.projectTitle).slice(0, 5),
      topLinks: buildRankings(filteredClickEvents, (event) => event.destination).slice(0, 5),
      selectedRangeVisits: filteredEvents.filter((event) => event.type === 'page_visit').length,
      selectedRangeClicks: filteredClickEvents.length,
      sparkToday: getKpiTrendData(buildActivitySeries(todayEvents, 'today'), 'visits'),
      spark7d: getKpiTrendData(buildActivitySeries(sevenDayEvents, '7d'), 'visits'),
      spark30d: getKpiTrendData(buildActivitySeries(thirtyDayEvents, '30d'), 'visits'),
      sparkClicks: getKpiTrendData(activitySeries, 'clicks'),
      sparkLinkedIn: getKpiTrendData(
        buildActivitySeries(events.filter((event) => event.type === 'linkedin_post_click'), activeFilter.id),
        'clicks',
      ),
      sparkActive: getKpiTrendData(activitySeries, 'visits'),
    }
  }, [activeFilter.id, events, filteredEvents])

  const hasEnoughTrendData =
    analytics.activitySeries.length >= 4 &&
    analytics.activitySeries.some((point) => point.visits > 0 || point.clicks > 0)

  if (!firebaseEnabled) {
    return (
      <SectionCard
        eyebrow="Insights"
        title="Analytics needs Firebase"
        description="Internal analytics require Firebase so the public site can write minimal event records to Firestore."
      >
        <p className="text-sm text-slate-400">Add your Firebase environment variables to enable event ingestion and the admin analytics dashboard.</p>
      </SectionCard>
    )
  }

  return (
    <div className="space-y-6">
      <SectionCard
        eyebrow="Insights"
        title="Portfolio intelligence"
        description="Your internal event dashboard for traffic and engagement. GA4 and Clarity still remain the source of truth for their own external reporting views."
        action={(
          <div className="flex flex-col items-stretch gap-3 lg:items-end">
            <FilterSegment selectedFilter={selectedFilter} onSelect={setSelectedFilter} />
            <button
              type="button"
              onClick={loadEvents}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-slate-300 transition hover:border-white/[0.14] hover:bg-white/[0.08] hover:text-white"
            >
              <RefreshCw size={14} />
              Refresh data
            </button>
          </div>
        )}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.10),transparent_28%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.08),transparent_24%)]" />
        <div className="relative grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,1fr)]">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[24px] border border-sky-500/15 bg-sky-500/8 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-300/80">Selected range</p>
              <p className="mt-3 text-2xl font-semibold text-white">{activeFilter.label}</p>
              <p className="mt-2 text-sm text-slate-400">Every chart and ranking below is based on this filter.</p>
            </div>
            <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Visits in range</p>
              <p className="mt-3 text-2xl font-semibold text-white">{formatCompactNumber(analytics.selectedRangeVisits)}</p>
              <p className="mt-2 text-sm text-slate-400">Internal `page_visit` events in the active window.</p>
            </div>
            <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Clicks in range</p>
              <p className="mt-3 text-2xl font-semibold text-white">{formatCompactNumber(analytics.selectedRangeClicks)}</p>
              <p className="mt-2 text-sm text-slate-400">Tracked engagement across links, CTAs, contact and social actions.</p>
            </div>
          </div>

          <div className="rounded-[24px] border border-white/[0.08] bg-slate-950/60 p-4">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              <Gauge size={14} />
              Reading guide
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-400">
              <p>Active users is approximate and based on unique session IDs seen in the last 5 minutes.</p>
              <p>These insights come from your internal Firestore event stream, not a live GA4 or Clarity embed.</p>
              <p className="text-slate-500">{updatedAt ? `Last updated ${formatTimestamp(updatedAt)}` : 'Waiting for first sync'}</p>
            </div>
          </div>
        </div>
      </SectionCard>

      {loading ? <LoadingGrid /> : null}

      {!loading && error ? (
        <SectionCard eyebrow="Status" title="Analytics couldn’t load" description="The dashboard could not fetch your internal event stream right now.">
          <p className="text-sm text-rose-300">{error}</p>
        </SectionCard>
      ) : null}

      {!loading && !error && events.length === 0 ? (
        <EmptyPanel
          icon={BarChart3}
          title="No analytics events yet"
          description="Once visitors reach the site and interact with tracked links or sections, this dashboard will turn into a live SaaS-style overview of your portfolio traffic."
        />
      ) : null}

      {!loading && !error && events.length > 0 ? (
        <>
          <section className="space-y-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-400">KPI overview</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">What matters first</h2>
              <p className="mt-2 text-sm text-slate-400">The six headline metrics are designed to answer the fastest admin questions in a few seconds.</p>
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
              <MetricCard title="Visits today" value={formatCompactNumber(analytics.visitsToday)} icon={Activity} accent={KPI_GRADIENTS.sky} hint="Internal page visits recorded since midnight." comparison={computeDelta(analytics.visitsToday, analytics.previousVisitsToday)} comparisonLabel={FILTERS[0].previousLabel} trendValues={analytics.sparkToday} sparkColor="bg-sky-400/90" />
              <MetricCard title="Visits last 7 days" value={formatCompactNumber(analytics.visits7d)} icon={TrendingUp} accent={KPI_GRADIENTS.emerald} hint="Your week-level traffic pulse." comparison={computeDelta(analytics.visits7d, analytics.previousVisits7d)} comparisonLabel={FILTERS[1].previousLabel} trendValues={analytics.spark7d} sparkColor="bg-emerald-400/90" />
              <MetricCard title="Visits last 30 days" value={formatCompactNumber(analytics.visits30d)} icon={Clock3} accent={KPI_GRADIENTS.violet} hint="Longer-term traffic trend for the past month." comparison={computeDelta(analytics.visits30d, analytics.previousVisits30d)} comparisonLabel={FILTERS[2].previousLabel} trendValues={analytics.spark30d} sparkColor="bg-violet-400/90" />
              <MetricCard title="Total clicks" value={formatCompactNumber(analytics.totalTrackedClicks)} icon={MousePointerClick} accent={KPI_GRADIENTS.amber} hint="All tracked engagement clicks across the site." comparison={null} comparisonLabel="All time across every tracked event type" trendValues={analytics.sparkClicks} sparkColor="bg-amber-400/90" />
              <MetricCard title="LinkedIn clicks" value={formatCompactNumber(analytics.linkedinClicks)} icon={ExternalLink} accent={KPI_GRADIENTS.blue} hint="How often LinkedIn post links are opened." comparison={null} comparisonLabel="All time LinkedIn post interactions" trendValues={analytics.sparkLinkedIn} sparkColor="bg-blue-400/90" />
              <MetricCard title="Approx active users" value={formatCompactNumber(analytics.activeUsers)} icon={Users} accent={KPI_GRADIENTS.cyan} hint="Unique sessions seen in the last 5 minutes." comparison={null} comparisonLabel="Approximate live activity, not exact presence" trendValues={analytics.sparkActive} sparkColor="bg-cyan-400/90" />
            </div>
          </section>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(340px,1fr)]">
            <SectionCard eyebrow="Traffic trends" title="How attention is moving" description={`Visits and engagement across the selected ${activeFilter.label.toLowerCase()} window. Tooltips and legends are tuned to stay readable even when event volume is low.`}>
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-300"><span className="h-2 w-2 rounded-full bg-sky-400" />Visits</span>
                <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300"><span className="h-2 w-2 rounded-full bg-violet-400" />Clicks</span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs font-medium text-slate-400">Based on {activeFilter.label}</span>
              </div>

              {hasEnoughTrendData ? (
                <div className="h-[340px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.activitySeries} margin={{ left: 0, right: 12, top: 10, bottom: 4 }}>
                      <defs>
                        <linearGradient id="visitsGradient" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="clicksGradient" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="#a855f7" stopOpacity={0.32} />
                          <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                      <XAxis dataKey="label" stroke="#64748b" tickLine={false} axisLine={false} dy={10} />
                      <YAxis stroke="#64748b" tickLine={false} axisLine={false} allowDecimals={false} width={36} />
                      <Tooltip content={<DashboardTooltip />} />
                      <Area type="monotone" dataKey="visits" name="Visits" stroke="#38bdf8" strokeWidth={3} fill="url(#visitsGradient)" activeDot={{ r: 5, fill: '#38bdf8' }} />
                      <Area type="monotone" dataKey="clicks" name="Clicks" stroke="#a855f7" strokeWidth={3} fill="url(#clicksGradient)" activeDot={{ r: 5, fill: '#a855f7' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-[22px] border border-white/[0.08] bg-slate-950/50 p-4">
                    <p className="text-sm text-slate-300">Traffic is still light in this range, so a full chart would look sparse. This fallback keeps the dashboard readable without lonely chart points.</p>
                  </div>
                  <LowDataTrendFallback points={analytics.activitySeries.slice(-3)} />
                </div>
              )}
            </SectionCard>

            <SectionCard eyebrow="Priority signals" title="What is winning right now" description="A quick read on the strongest performers in the active range.">
              <div className="grid gap-3">
                <InsightTile icon={BarChart3} label="Top clicked project" value={analytics.topProject?.label} count={analytics.topProject?.count} accent="from-emerald-500/12 to-slate-950" />
                <InsightTile icon={Link2} label="Top clicked link" value={analytics.topLink?.label} count={analytics.topLink?.count} accent="from-sky-500/12 to-slate-950" />
                <InsightTile icon={MousePointerClick} label="Top contact method" value={analytics.topContact?.label} count={analytics.topContact?.count} accent="from-amber-500/12 to-slate-950" />
                <InsightTile icon={ExternalLink} label="Top social platform" value={analytics.topSocial?.label} count={analytics.topSocial?.count} accent="from-violet-500/12 to-slate-950" />
              </div>
            </SectionCard>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <SectionCard eyebrow="Engagement breakdown" title="Clicks by interaction type" description="Which parts of the site are earning the most engagement.">
              {analytics.clickTypeSeries.length > 0 ? (
                <div className="space-y-4">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.clickTypeSeries} layout="vertical" margin={{ left: 12, right: 12, top: 8, bottom: 8 }}>
                        <CartesianGrid stroke="rgba(148,163,184,0.1)" horizontal={false} />
                        <XAxis type="number" stroke="#64748b" tickLine={false} axisLine={false} allowDecimals={false} />
                        <YAxis dataKey="label" type="category" stroke="#64748b" tickLine={false} axisLine={false} width={90} />
                        <Tooltip content={<DashboardTooltip />} />
                        <Bar dataKey="count" name="Clicks" radius={[0, 12, 12, 0]}>
                          {analytics.clickTypeSeries.map((entry) => (
                            <Cell key={entry.type} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {analytics.clickTypeSeries.map((item) => (
                      <div key={item.type} className="rounded-2xl border border-white/[0.06] bg-slate-950/55 px-3 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-medium text-white">{item.label}</p>
                          <span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={{ backgroundColor: `${item.fill}1a`, color: item.fill }}>
                            {item.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyPanel icon={MousePointerClick} title="No click breakdown yet" description="Once visitors click CTAs, projects, contact methods, or social links, this section will show where engagement is happening." />
              )}
            </SectionCard>

            <SectionCard eyebrow="Traffic sources" title="Page visits by page" description="Where visitors are landing and spending attention inside the app.">
              {analytics.pageSeries.length > 0 ? (
                <div className="space-y-4">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.pageSeries} layout="vertical" margin={{ left: 10, right: 12, top: 8, bottom: 8 }}>
                        <CartesianGrid stroke="rgba(148,163,184,0.1)" horizontal={false} />
                        <XAxis type="number" stroke="#64748b" tickLine={false} axisLine={false} allowDecimals={false} />
                        <YAxis dataKey="label" type="category" stroke="#64748b" tickLine={false} axisLine={false} width={120} />
                        <Tooltip content={<DashboardTooltip />} />
                        <Bar dataKey="count" name="Visits" radius={[0, 12, 12, 0]} fill="#38bdf8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2">
                    {analytics.pageSeries.map((item) => (
                      <div key={item.label} className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-slate-950/55 px-4 py-3">
                        <p className="truncate text-sm text-white">{truncateLabel(item.label, 54)}</p>
                        <span className="rounded-full bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-300">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyPanel icon={Eye} title="No page distribution yet" description="As soon as page visits are recorded in the selected range, this section will show where traffic is clustering." />
              )}
            </SectionCard>
          </div>

          <section className="space-y-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-400">Top performers</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Performance leaders</h2>
              <p className="mt-2 text-sm text-slate-400">These blocks turn the raw event stream into easy leaderboard-style snapshots.</p>
            </div>

            <div className="grid gap-6 xl:grid-cols-2 2xl:grid-cols-4">
              <SectionCard eyebrow="Projects" title="Top clicked projects" description="Which projects are pulling the most curiosity.">
                <RankedList items={analytics.topProjects} emptyText="No project clicks in this range yet." badgeTone="emerald" />
              </SectionCard>
              <SectionCard eyebrow="Links" title="Top clicked links" description="Most opened destinations across tracked actions.">
                <RankedList items={analytics.topLinks} emptyText="No tracked link destinations in this range yet." badgeTone="violet" />
              </SectionCard>
              <SectionCard eyebrow="Contact" title="Top contact methods" description="Which contact actions are getting attention.">
                <RankedList items={analytics.topContactMethods} emptyText="No contact actions in this range yet." badgeTone="amber" />
              </SectionCard>
              <SectionCard eyebrow="Social" title="Top social platforms" description="How social clicks are distributing across platforms.">
                <RankedList items={analytics.topSocialMethods} emptyText="No social clicks in this range yet." badgeTone="sky" />
              </SectionCard>
            </div>
          </section>

          <SectionCard eyebrow="Recent activity" title="Latest tracked actions" description="A readable live-style feed of the newest recorded internal analytics events in the selected range.">
            {analytics.recentEvents.length > 0 ? (
              <div className="overflow-hidden rounded-[24px] border border-white/[0.06]">
                <div className="grid grid-cols-[1fr_1.1fr_1.2fr_0.85fr] gap-3 bg-white/[0.03] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  <span>Event</span>
                  <span>Page</span>
                  <span>Target</span>
                  <span>When</span>
                </div>
                {analytics.recentEvents.map((event) => (
                  <div key={event.id} className="grid grid-cols-[1fr_1.1fr_1.2fr_0.85fr] gap-3 border-t border-white/[0.06] px-4 py-3 text-sm text-slate-300 transition hover:bg-white/[0.02]">
                    <div className="min-w-0">
                      <EventPill type={event.type} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-slate-300">{event.page || '—'}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-white">{truncateLabel(event.label || event.projectTitle || event.destination, 40)}</p>
                      <p className="mt-1 truncate text-xs text-slate-500">{event.destination ? truncateLabel(event.destination, 52) : getEventTypeLabel(event.type)}</p>
                    </div>
                    <div className="text-slate-500">{formatTimestamp(event.createdAt)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyPanel icon={Clock3} title="No recent activity in this range" description="Try a wider filter like 30 days or all time to inspect earlier traffic." />
            )}
          </SectionCard>
        </>
      ) : null}
    </div>
  )
}

export default AnalyticsDashboardSection
