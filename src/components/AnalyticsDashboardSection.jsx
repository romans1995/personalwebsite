import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Activity,
  BarChart3,
  Clock3,
  ExternalLink,
  Link2,
  MousePointerClick,
  RefreshCw,
  TrendingUp,
  Users,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { listAnalyticsEvents } from '../services/analyticsService'

const FILTERS = [
  { id: 'today', label: 'Today', days: 1 },
  { id: '7d', label: '7d', days: 7 },
  { id: '30d', label: '30d', days: 30 },
  { id: 'all', label: 'All time', days: null },
]

const CLICK_EVENT_TYPES = [
  'hero_cta_click',
  'project_click',
  'contact_click',
  'social_click',
  'linkedin_post_click',
]

const EVENT_COLORS = {
  hero_cta_click: '#38bdf8',
  project_click: '#22c55e',
  contact_click: '#f59e0b',
  social_click: '#a855f7',
  linkedin_post_click: '#60a5fa',
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

function countUniqueSessionIds(events, startDate) {
  const activeSessions = new Set()

  events.forEach((event) => {
    if (!event.createdAt || event.createdAt < startDate || !event.sessionId) return
    activeSessions.add(event.sessionId)
  })

  return activeSessions.size
}

function formatCompactNumber(value) {
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
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
    if (event.type === 'page_visit') {
      bucket.visits += 1
    }
    if (CLICK_EVENT_TYPES.includes(event.type)) {
      bucket.clicks += 1
    }
  })

  return Array.from(buckets.values()).sort((left, right) => left.key.localeCompare(right.key))
}

function buildEventTypeSeries(events) {
  return CLICK_EVENT_TYPES.map((type) => ({
    type,
    count: events.filter((event) => event.type === type).length,
    fill: EVENT_COLORS[type],
  })).filter((item) => item.count > 0)
}

function buildPageSeries(events) {
  return buildRankings(
    events.filter((event) => event.type === 'page_visit'),
    (event) => event.page,
  ).slice(0, 6)
}

function MetricCard({ title, value, hint, icon, accent }) {
  const Icon = icon

  return (
    <div className={`relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br ${accent} p-5 shadow-[0_20px_80px_rgba(15,23,42,0.35)]`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_40%)]" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300/80">{title}</p>
          <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
          <p className="mt-2 text-sm text-slate-300/80">{hint}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/10 p-3 text-white">
          <Icon size={18} />
        </div>
      </div>
    </div>
  )
}

function Panel({ title, description, action, children, className = '' }) {
  return (
    <section className={`rounded-3xl border border-white/[0.08] bg-white/[0.04] p-5 backdrop-blur-xl sm:p-6 ${className}`}>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          {description ? <p className="mt-1 text-sm text-slate-400">{description}</p> : null}
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
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-36 rounded-3xl border border-white/[0.06] bg-white/[0.04]" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(340px,1fr)]">
        <div className="h-96 rounded-3xl border border-white/[0.06] bg-white/[0.04]" />
        <div className="h-96 rounded-3xl border border-white/[0.06] bg-white/[0.04]" />
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-white/[0.1] bg-slate-950/50 px-6 py-12 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-300">
        <BarChart3 size={20} />
      </div>
      <h3 className="text-lg font-semibold text-white">No analytics events yet</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm text-slate-400">
        Once people visit the site and click tracked actions, this dashboard will populate from your internal Firestore event stream.
      </p>
    </div>
  )
}

function AnalyticsDashboardSection({ firebaseEnabled }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('7d')

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

    return {
      visitsToday: todayEvents.filter((event) => event.type === 'page_visit').length,
      visits7d: sevenDayEvents.filter((event) => event.type === 'page_visit').length,
      visits30d: thirtyDayEvents.filter((event) => event.type === 'page_visit').length,
      totalTrackedClicks: clickEvents.length,
      linkedinClicks: events.filter((event) => event.type === 'linkedin_post_click').length,
      activeUsers,
      topProject,
      topLink,
      topContact,
      topSocial,
      activitySeries: buildActivitySeries(filteredEvents, activeFilter.id),
      pageSeries: buildPageSeries(filteredEvents),
      clickTypeSeries: buildEventTypeSeries(filteredEvents),
      recentEvents: filteredEvents.slice(0, 8),
      topProjects: buildRankings(filteredEvents.filter((event) => event.type === 'project_click'), (event) => event.projectTitle).slice(0, 6),
      topLinks: buildRankings(filteredClickEvents, (event) => event.destination).slice(0, 6),
    }
  }, [activeFilter.id, events, filteredEvents])

  if (!firebaseEnabled) {
    return (
      <Panel
        title="Analytics"
        description="Internal analytics require Firebase so the public site can write minimal event records to Firestore."
      >
        <p className="text-sm text-slate-400">Add your Firebase environment variables to enable event ingestion and the admin analytics dashboard.</p>
      </Panel>
    )
  }

  return (
    <div className="space-y-6">
      <Panel
        title="Insights"
        description="Internal event analytics from your own tracked interactions. GA4 and Clarity remain the source of truth for their external dashboards."
        action={(
          <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setSelectedFilter(filter.id)}
                className={`rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                  selectedFilter === filter.id
                    ? 'bg-gradient-to-r from-sky-500/20 to-violet-500/20 text-white'
                    : 'border border-white/[0.08] bg-white/[0.03] text-slate-400 hover:text-white'
                }`}
              >
                {filter.label}
              </button>
            ))}
            <button
              type="button"
              onClick={loadEvents}
              className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-sm text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>
        )}
      >
        <p className="text-sm text-slate-400">
          Active users are approximate and based on unique session IDs seen in the last 5 minutes. Frontend-written events are useful, but not tamper-proof without a backend ingestion layer.
        </p>
      </Panel>

      {loading ? <LoadingGrid /> : null}
      {!loading && error ? (
        <Panel title="Analytics error" description="The dashboard could not load your event stream.">
          <p className="text-sm text-rose-300">{error}</p>
        </Panel>
      ) : null}
      {!loading && !error && events.length === 0 ? <EmptyState /> : null}

      {!loading && !error && events.length > 0 ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <MetricCard title="Visits today" value={formatCompactNumber(analytics.visitsToday)} hint="Internal page_visit events since midnight" icon={Activity} accent="from-sky-500/20 via-slate-900 to-slate-950" />
            <MetricCard title="Visits last 7 days" value={formatCompactNumber(analytics.visits7d)} hint="Internal page_visit events in the last 7 days" icon={TrendingUp} accent="from-emerald-500/20 via-slate-900 to-slate-950" />
            <MetricCard title="Visits last 30 days" value={formatCompactNumber(analytics.visits30d)} hint="Internal page_visit events in the last 30 days" icon={Clock3} accent="from-violet-500/20 via-slate-900 to-slate-950" />
            <MetricCard title="Total tracked clicks" value={formatCompactNumber(analytics.totalTrackedClicks)} hint="All internal tracked click events" icon={MousePointerClick} accent="from-amber-500/20 via-slate-900 to-slate-950" />
            <MetricCard title="LinkedIn post clicks" value={formatCompactNumber(analytics.linkedinClicks)} hint="All time LinkedIn post interactions" icon={ExternalLink} accent="from-blue-500/20 via-slate-900 to-slate-950" />
            <MetricCard title="Approx active users now" value={formatCompactNumber(analytics.activeUsers)} hint="Unique session IDs seen in the last 5 minutes" icon={Users} accent="from-cyan-500/20 via-slate-900 to-slate-950" />
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]">
            <Panel title="Activity over time" description={`Visits and clicks for the selected ${activeFilter.label.toLowerCase()} window.`}>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.activitySeries}>
                    <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                    <XAxis dataKey="label" stroke="#94a3b8" tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        borderRadius: '16px',
                        color: '#e2e8f0',
                      }}
                    />
                    <Line type="monotone" dataKey="visits" name="Visits" stroke="#38bdf8" strokeWidth={3} dot={false} />
                    <Line type="monotone" dataKey="clicks" name="Clicks" stroke="#a855f7" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <Panel title="Top insights" description="Best-performing items within the selected filter.">
              <div className="space-y-4">
                {[
                  { label: 'Top clicked project', value: analytics.topProject?.label, count: analytics.topProject?.count, icon: BarChart3 },
                  { label: 'Top clicked link', value: analytics.topLink?.label, count: analytics.topLink?.count, icon: Link2 },
                  { label: 'Top clicked contact method', value: analytics.topContact?.label, count: analytics.topContact?.count, icon: MousePointerClick },
                  { label: 'Top clicked social platform', value: analytics.topSocial?.label, count: analytics.topSocial?.count, icon: ExternalLink },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/[0.08] bg-slate-950/50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-2xl bg-white/[0.05] p-3 text-sky-300">
                        <item.icon size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                        <p className="mt-2 truncate text-sm font-medium text-white">{item.value || 'No data yet'}</p>
                        <p className="mt-1 text-xs text-slate-400">{item.count ? `${item.count} tracked interactions` : 'Waiting for events'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Panel title="Page visits by page" description="Internal page_visit distribution for the selected range.">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.pageSeries} layout="vertical" margin={{ left: 12 }}>
                    <CartesianGrid stroke="rgba(148,163,184,0.1)" horizontal={false} />
                    <XAxis type="number" stroke="#94a3b8" tickLine={false} axisLine={false} allowDecimals={false} />
                    <YAxis dataKey="label" type="category" stroke="#94a3b8" tickLine={false} axisLine={false} width={120} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        borderRadius: '16px',
                        color: '#e2e8f0',
                      }}
                    />
                    <Bar dataKey="count" radius={[0, 10, 10, 0]} fill="#38bdf8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <Panel title="Clicks by event type" description="Tracked click volume broken down by event type.">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.clickTypeSeries}>
                    <CartesianGrid stroke="rgba(148,163,184,0.1)" vertical={false} />
                    <XAxis dataKey="type" stroke="#94a3b8" tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        borderRadius: '16px',
                        color: '#e2e8f0',
                      }}
                    />
                    <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                      {analytics.clickTypeSeries.map((entry) => (
                        <Cell key={entry.type} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
            <Panel title="Recent activity" description="Most recent tracked internal events in the selected range.">
              <div className="overflow-hidden rounded-2xl border border-white/[0.06]">
                <div className="grid grid-cols-[1.1fr_1fr_1.1fr_0.8fr] gap-3 bg-white/[0.03] px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  <span>Event</span>
                  <span>Page</span>
                  <span>Label</span>
                  <span>Time</span>
                </div>
                {analytics.recentEvents.map((event) => (
                  <div key={event.id} className="grid grid-cols-[1.1fr_1fr_1.1fr_0.8fr] gap-3 border-t border-white/[0.06] px-4 py-3 text-sm text-slate-300">
                    <span className="truncate">{event.type}</span>
                    <span className="truncate text-slate-400">{event.page || '—'}</span>
                    <span className="truncate text-slate-400">{event.label || event.projectTitle || event.destination || '—'}</span>
                    <span className="text-slate-500">{formatTimestamp(event.createdAt)}</span>
                  </div>
                ))}
              </div>
            </Panel>

            <div className="space-y-6">
              <Panel title="Top projects" description="Projects generating the most tracked clicks.">
                <div className="space-y-3">
                  {analytics.topProjects.length > 0 ? analytics.topProjects.map((item, index) => (
                    <div key={item.label} className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-slate-950/50 px-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">{item.label}</p>
                        <p className="text-xs text-slate-500">Rank #{index + 1}</p>
                      </div>
                      <span className="rounded-full bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-300">{item.count}</span>
                    </div>
                  )) : <p className="text-sm text-slate-400">No project clicks in this range yet.</p>}
                </div>
              </Panel>

              <Panel title="Top links" description="Most-clicked destinations across tracked actions.">
                <div className="space-y-3">
                  {analytics.topLinks.length > 0 ? analytics.topLinks.map((item, index) => (
                    <div key={item.label} className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-slate-950/50 px-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">{item.label}</p>
                        <p className="text-xs text-slate-500">Rank #{index + 1}</p>
                      </div>
                      <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300">{item.count}</span>
                    </div>
                  )) : <p className="text-sm text-slate-400">No tracked link destinations in this range yet.</p>}
                </div>
              </Panel>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}

export default AnalyticsDashboardSection
