import posthog from 'posthog-js'

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com'

const FIRST_VISIT_KEY = 'firstdraft_first_visit'
const ANONYMOUS_ID_KEY = 'firstdraft_anonymous_id'

let isInitialized = false

/**
 * Initialize PostHog analytics
 */
export function initAnalytics() {
  if (typeof window === 'undefined' || isInitialized) return

  if (POSTHOG_KEY) {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      loaded: (ph) => {
        // Check if this is a first-time user
        const isFirstTime = checkAndSetFirstVisit()
        const anonymousId = getOrCreateAnonymousId()

        // Identify user with anonymous ID and first-time status
        ph.identify(anonymousId, {
          is_first_time: isFirstTime,
        })

        // Track initial page view
        ph.capture('$pageview', {
          page: window.location.pathname,
          is_first_time: isFirstTime,
        })
      },
    })
    isInitialized = true
  }
}

/**
 * Check if this is the user's first visit and set the flag
 */
function checkAndSetFirstVisit(): boolean {
  if (typeof window === 'undefined') return true

  const firstVisit = localStorage.getItem(FIRST_VISIT_KEY)

  if (!firstVisit) {
    // This is the first visit
    localStorage.setItem(FIRST_VISIT_KEY, new Date().toISOString())
    return true
  }

  return false
}

/**
 * Check if user is first-time (without setting flag)
 */
export function isFirstTimeUser(): boolean {
  if (typeof window === 'undefined') return true
  return !localStorage.getItem(FIRST_VISIT_KEY)
}

/**
 * Get or create anonymous ID for user tracking
 */
function getOrCreateAnonymousId(): string {
  if (typeof window === 'undefined') return `anon_${Date.now()}`

  let anonymousId = localStorage.getItem(ANONYMOUS_ID_KEY)

  if (!anonymousId) {
    anonymousId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem(ANONYMOUS_ID_KEY, anonymousId)
  }

  return anonymousId
}

/**
 * Get current anonymous ID
 */
export function getAnonymousId(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem(ANONYMOUS_ID_KEY) || ''
}

/**
 * Track an analytics event
 */
export function trackEvent(
  event: string,
  properties?: Record<string, unknown>
) {
  if (!isInitialized || !POSTHOG_KEY) {
    console.log('[Analytics]', event, properties)
    return
  }

  posthog.capture(event, {
    ...properties,
    is_first_time: isFirstTimeUser(),
  })
}

/**
 * Track page view
 */
export function trackPageView(pageName: string) {
  trackEvent('$pageview', { page: pageName })
}

/**
 * Analytics helper object with semantic methods
 */
export const analytics = {
  init: initAnalytics,

  identify: (userId: string, properties?: Record<string, unknown>) => {
    if (!isInitialized || !POSTHOG_KEY) return
    posthog.identify(userId, properties)
  },

  track: trackEvent,
  page: trackPageView,

  // Event tracking helpers
  ideaSubmitted: (ideaLength: number, template?: string) => {
    trackEvent('idea_submitted', { idea_length: ideaLength, template })
  },

  generationStarted: (ideaLength: number) => {
    trackEvent('generation_started', { idea_length: ideaLength })
  },

  generationCompleted: (durationMs: number) => {
    trackEvent('generation_completed', { duration_ms: durationMs })
  },

  pageShared: (pageId: string) => {
    trackEvent('page_shared', { page_id: pageId })
  },

  feedbackSubmitted: (feedbackLength: number) => {
    trackEvent('feedback_submitted', { feedback_length: feedbackLength })
  },
}
