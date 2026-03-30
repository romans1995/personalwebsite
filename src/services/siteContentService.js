import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase'
import { defaultSiteContent } from '../data/defaultSiteContent'
import { deepMerge } from '../lib/deepMerge'
import { sanitizeSiteContent } from '../lib/siteContentSanitizer'

const CONTENT_PATH = ['siteContent', 'main']

function getContentRef() {
  return doc(db, ...CONTENT_PATH)
}

export function subscribeToSiteContent(onData, onError) {
  if (!isFirebaseConfigured) {
    onData(defaultSiteContent)
    return () => {}
  }

  return onSnapshot(
    getContentRef(),
    (snapshot) => {
      if (!snapshot.exists()) {
        onData(defaultSiteContent)
        return
      }

      onData(sanitizeSiteContent(deepMerge(defaultSiteContent, snapshot.data())))
    },
    (error) => {
      onError?.(error)
      onData(defaultSiteContent)
    },
  )
}

export async function saveSiteContent(content) {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase is not configured.')
  }

  const sanitizedContent = sanitizeSiteContent(content)

  await setDoc(
    getContentRef(),
    {
      ...sanitizedContent,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )
}

export async function initializeSiteContent() {
  if (!isFirebaseConfigured) {
    return defaultSiteContent
  }

  const snapshot = await getDoc(getContentRef())

  if (!snapshot.exists()) {
    const seededContent = sanitizeSiteContent(defaultSiteContent)
    await setDoc(getContentRef(), {
      ...seededContent,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return seededContent
  }

  return sanitizeSiteContent(deepMerge(defaultSiteContent, snapshot.data()))
}
