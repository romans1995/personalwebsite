import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  where,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase'

export const ANALYTICS_COLLECTION = 'analyticsEvents'

export const INTERNAL_ANALYTICS_EVENT_TYPES = [
  'page_visit',
  'hero_cta_click',
  'project_click',
  'contact_click',
  'social_click',
  'linkedin_post_click',
  'admin_login_view',
]

const SESSION_STORAGE_KEY = 'portfolio_analytics_session_id'
const MAX_PAGE_SIZE = 240
const MAX_LABEL_SIZE = 160
const MAX_DESTINATION_SIZE = 512
const MAX_PROJECT_TITLE_SIZE = 200
const MAX_REFERRER_SIZE = 512

function canUseDom() {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

function getAnalyticsCollection() {
  return collection(db, ANALYTICS_COLLECTION)
}

function getSessionId() {
  if (!canUseDom()) return 'serverless-session'

  const existing = window.sessionStorage.getItem(SESSION_STORAGE_KEY)
  if (existing) return existing

  const nextValue =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `session_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`

  window.sessionStorage.setItem(SESSION_STORAGE_KEY, nextValue)
  return nextValue
}

function getDeviceType() {
  if (!canUseDom()) return 'unknown'

  const width = window.innerWidth || 0
  if (width < 640) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}

function getCurrentPage() {
  if (!canUseDom()) return '/'
  return `${window.location.pathname}${window.location.search}${window.location.hash}`.slice(0, MAX_PAGE_SIZE)
}

function sanitizeString(value, maxLength) {
  const normalized = String(value || '').trim()
  return normalized ? normalized.slice(0, maxLength) : null
}

function buildMetadata(params) {
  const metadata = {}

  const metadataMap = {
    action: params.action,
    ctaStyle: params.cta_style,
    linkType: params.link_type,
    source: params.source,
    section: params.section,
    path: params.path,
  }

  Object.entries(metadataMap).forEach(([key, value]) => {
    const normalized = sanitizeString(value, 120)
    if (normalized) metadata[key] = normalized
  })

  return metadata
}

function buildAnalyticsEvent(type, params = {}) {
  return {
    type,
    createdAt: serverTimestamp(),
    page: sanitizeString(params.page, MAX_PAGE_SIZE) || getCurrentPage(),
    label:
      sanitizeString(params.label, MAX_LABEL_SIZE) ||
      sanitizeString(params.cta_label, MAX_LABEL_SIZE) ||
      sanitizeString(params.link_label, MAX_LABEL_SIZE),
    destination: sanitizeString(params.destination, MAX_DESTINATION_SIZE),
    projectTitle:
      sanitizeString(params.projectTitle, MAX_PROJECT_TITLE_SIZE) ||
      sanitizeString(params.project_title, MAX_PROJECT_TITLE_SIZE),
    sessionId: sanitizeString(params.sessionId, 128) || getSessionId(),
    deviceType: sanitizeString(params.deviceType, 32) || getDeviceType(),
    referrer: sanitizeString(params.referrer, MAX_REFERRER_SIZE) || sanitizeString(document.referrer, MAX_REFERRER_SIZE),
    metadata: buildMetadata(params),
  }
}

export async function logAnalyticsEvent(type, params = {}) {
  if (!isFirebaseConfigured || !INTERNAL_ANALYTICS_EVENT_TYPES.includes(type)) {
    return
  }

  try {
    await addDoc(getAnalyticsCollection(), buildAnalyticsEvent(type, params))
  } catch {
    // Analytics should never block the product experience.
  }
}

function normalizeEvent(docSnapshot) {
  const data = docSnapshot.data()
  return {
    id: docSnapshot.id,
    ...data,
    createdAt: data.createdAt?.toDate?.() || null,
  }
}

export async function listAnalyticsEvents({ startDate = null } = {}) {
  if (!isFirebaseConfigured) return []

  const baseConstraints = []
  if (startDate) {
    baseConstraints.push(where('createdAt', '>=', startDate))
  }

  let cursor = null
  const events = []

  while (true) {
    const constraints = [...baseConstraints, orderBy('createdAt', 'desc')]
    if (cursor) constraints.push(startAfter(cursor))
    constraints.push(limit(500))

    const snapshot = await getDocs(query(getAnalyticsCollection(), ...constraints))
    if (snapshot.empty) break

    snapshot.docs.forEach((docSnapshot) => {
      events.push(normalizeEvent(docSnapshot))
    })

    if (snapshot.docs.length < 500) break
    cursor = snapshot.docs[snapshot.docs.length - 1]
  }

  return events
}
