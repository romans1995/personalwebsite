const GA_MEASUREMENT_ID = (import.meta.env.VITE_GA_MEASUREMENT_ID || '').trim()
const CLARITY_PROJECT_ID = (import.meta.env.VITE_CLARITY_PROJECT_ID || '').trim()

let initialized = false
let clarityInitialized = false
let lastTrackedPath = ''
const sentEventKeys = new Set()

export const ANALYTICS_EVENTS = {
  HERO_CTA_CLICK: 'hero_cta_click',
  PROJECT_CLICK: 'project_click',
  CONTACT_CLICK: 'contact_click',
  SOCIAL_CLICK: 'social_click',
  LINKEDIN_POST_CLICK: 'linkedin_post_click',
  ADMIN_LOGIN_VIEW: 'admin_login_view',
}

function hasAnalyticsConfig() {
  return Boolean(GA_MEASUREMENT_ID)
}

function hasClarityConfig() {
  return Boolean(CLARITY_PROJECT_ID)
}

function shouldLoadClarity() {
  return import.meta.env.PROD && hasClarityConfig()
}

function canUseDom() {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

function getGtag() {
  if (!canUseDom()) return null
  return typeof window.gtag === 'function' ? window.gtag : null
}

function addGaScript() {
  if (!canUseDom()) return
  if (document.getElementById('ga4-script')) return

  const script = document.createElement('script')
  script.id = 'ga4-script'
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`
  document.head.appendChild(script)
}

function addClarityScript() {
  if (!canUseDom()) return
  if (document.getElementById('clarity-script')) return

  const script = document.createElement('script')
  script.id = 'clarity-script'
  script.async = true
  script.src = `https://www.clarity.ms/tag/${encodeURIComponent(CLARITY_PROJECT_ID)}`
  document.head.appendChild(script)
}

export function initClarity() {
  if (clarityInitialized || !shouldLoadClarity() || !canUseDom()) return false

  window.clarity =
    window.clarity ||
    function clarity() {
      ;(window.clarity.q = window.clarity.q || []).push(arguments)
    }

  addClarityScript()
  clarityInitialized = true
  return true
}

export function initAnalytics() {
  initClarity()
  if (initialized || !hasAnalyticsConfig() || !canUseDom()) return false

  addGaScript()
  window.dataLayer = window.dataLayer || []
  window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments) }

  window.gtag('js', new Date())
  window.gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: false,
  })

  initialized = true
  return true
}

function sendEvent(eventName, params = {}, options = {}) {
  if (!hasAnalyticsConfig()) return

  if (options.dedupeKey) {
    if (sentEventKeys.has(options.dedupeKey)) return
    sentEventKeys.add(options.dedupeKey)
  }

  initAnalytics()
  const gtag = getGtag()
  if (!gtag) return

  gtag('event', eventName, params)
}

export function trackPageView(path, title = document?.title || '') {
  if (!path || path === lastTrackedPath) return
  lastTrackedPath = path

  sendEvent('page_view', {
    page_path: path,
    page_title: title,
    page_location: canUseDom() ? window.location.href : undefined,
  })
}

export function trackEvent(eventName, params = {}) {
  sendEvent(eventName, params)
}

export function trackHeroCtaClick(params = {}) {
  trackEvent(ANALYTICS_EVENTS.HERO_CTA_CLICK, params)
}

export function trackProjectClick(params = {}) {
  trackEvent(ANALYTICS_EVENTS.PROJECT_CLICK, params)
}

export function trackContactClick(params = {}) {
  trackEvent(ANALYTICS_EVENTS.CONTACT_CLICK, params)
}

export function trackSocialClick(params = {}) {
  trackEvent(ANALYTICS_EVENTS.SOCIAL_CLICK, params)
}

export function trackLinkedinPostClick(params = {}) {
  trackEvent(ANALYTICS_EVENTS.LINKEDIN_POST_CLICK, params)
}

export function trackAdminLoginView(params = {}) {
  const path = params.path || '/studio/login'
  sendEvent(ANALYTICS_EVENTS.ADMIN_LOGIN_VIEW, params, {
    dedupeKey: `${ANALYTICS_EVENTS.ADMIN_LOGIN_VIEW}:${path}`,
  })
}

export function isLinkedInPostUrl(url) {
  const value = String(url || '')
  return /^(https?:\/\/)?([\w-]+\.)?linkedin\.com\/posts\//i.test(value)
}

export function analyticsEnabled() {
  return hasAnalyticsConfig()
}

export function clarityEnabled() {
  return shouldLoadClarity()
}
