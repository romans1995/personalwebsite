import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { initAnalytics, trackPageView } from '../lib/analytics'

function AnalyticsPageTracker() {
  const location = useLocation()

  useEffect(() => {
    initAnalytics()
  }, [])

  useEffect(() => {
    const path = `${location.pathname}${location.search}${location.hash}`
    const frame = window.requestAnimationFrame(() => {
      trackPageView(path, document.title)
    })

    return () => window.cancelAnimationFrame(frame)
  }, [location.hash, location.pathname, location.search])

  return null
}

export default AnalyticsPageTracker
