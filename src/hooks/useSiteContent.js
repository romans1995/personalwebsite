import { useEffect, useMemo, useState } from 'react'
import { defaultSiteContent } from '../data/defaultSiteContent'
import { subscribeToSiteContent } from '../services/siteContentService'

export function useSiteContent() {
  const [content, setContent] = useState(defaultSiteContent)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const unsubscribe = subscribeToSiteContent(
      (nextContent) => {
        setContent(nextContent)
        setLoading(false)
      },
      (nextError) => {
        setError(nextError)
        setLoading(false)
      },
    )

    return unsubscribe
  }, [])

  return useMemo(
    () => ({ content, loading, error }),
    [content, loading, error],
  )
}
