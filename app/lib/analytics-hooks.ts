import { useCallback, useEffect } from 'react'
import { analytics } from './analytics'

// Hook for modal analytics
export const useModalAnalytics = () => {
  const trackModalOpen = useCallback(() => {
    analytics.modalOpen()
  }, [])

  const trackModalClose = useCallback(
    (method: 'button' | 'overlay' | 'get_started') => {
      analytics.modalClose(method)
    },
    []
  )

  return { trackModalOpen, trackModalClose }
}

// Hook for search analytics with automatic error and performance tracking
export const useSearchAnalytics = () => {
  const trackSearchStart = useCallback((query: string, conciseness: string) => {
    analytics.searchQuery(query, conciseness)
    return Date.now() // Return start time for performance tracking
  }, [])

  const trackSearchComplete = useCallback(
    (queryLength: number, startTime: number) => {
      const responseTime = Date.now() - startTime
      analytics.responseTime(queryLength, responseTime)
    },
    []
  )

  const trackSearchError = useCallback((endpoint: string, error: string) => {
    analytics.apiError(endpoint, error)
  }, [])

  return { trackSearchStart, trackSearchComplete, trackSearchError }
}

// Hook for UI interaction analytics
export const useUIAnalytics = () => {
  const trackConcisenesChange = useCallback(
    (oldValue: string, newValue: string) => {
      analytics.concisenesChange(oldValue, newValue)
    },
    []
  )

  const trackThemeToggle = useCallback((newTheme: string) => {
    analytics.themeToggle(newTheme)
  }, [])

  const trackShuffle = useCallback(() => {
    analytics.shuffleQuestions()
  }, [])

  return { trackConcisenesChange, trackThemeToggle, trackShuffle }
}

// Hook for navigation analytics
export const useNavigationAnalytics = () => {
  const trackFollowUpClick = useCallback((question: string, index: number) => {
    analytics.followUpClick(question, index)
  }, [])

  const trackConceptClick = useCallback((concept: string) => {
    analytics.conceptClick(concept)
  }, [])

  const trackHistoryClick = useCallback((queryText: string) => {
    analytics.historyEntryClick(queryText)
  }, [])

  const trackHistoryRevert = useCallback(
    (queryText: string, entryIndex: number) => {
      analytics.revertToHistory(queryText, entryIndex)
    },
    []
  )

  return {
    trackFollowUpClick,
    trackConceptClick,
    trackHistoryClick,
    trackHistoryRevert,
  }
}

// Enhanced handlers that combine business logic with analytics
export const useAnalyticsEnhancedHandlers = () => {
  const { trackSearchStart, trackSearchComplete, trackSearchError } =
    useSearchAnalytics()
  const { trackFollowUpClick, trackConceptClick } = useNavigationAnalytics()

  // Enhanced OpenAI handler with built-in analytics
  const enhancedOpenAICall = useCallback(
    async (
      query: string,
      conciseness: string,
      openAIHandler: (
        message: string,
        includeHistory: boolean,
        isFollowUp: boolean
      ) => Promise<void>,
      includeHistory: boolean = false,
      isFollowUp: boolean = false
    ) => {
      const startTime = trackSearchStart(query, conciseness)

      try {
        await openAIHandler(query, includeHistory, isFollowUp)
        trackSearchComplete(query.length, startTime)
      } catch (error) {
        trackSearchError(
          '/api/openai',
          error instanceof Error ? error.message : 'Unknown error'
        )
        throw error // Re-throw to maintain error handling in component
      }
    },
    [trackSearchStart, trackSearchComplete, trackSearchError]
  )

  // Enhanced follow-up handler with analytics
  const enhancedFollowUpHandler = useCallback(
    (
      question: string,
      index: number,
      openAIHandler: (
        message: string,
        includeHistory: boolean,
        isFollowUp: boolean
      ) => Promise<void>
    ) => {
      trackFollowUpClick(question, index)
      return openAIHandler(question, true, true)
    },
    [trackFollowUpClick]
  )

  // Enhanced concept click handler with analytics
  const enhancedConceptHandler = useCallback(
    (
      concept: string,
      openAIHandler: (
        message: string,
        includeHistory: boolean,
        isFollowUp: boolean
      ) => Promise<void>
    ) => {
      trackConceptClick(concept)
      return openAIHandler(concept, true, true)
    },
    [trackConceptClick]
  )

  return {
    enhancedOpenAICall,
    enhancedFollowUpHandler,
    enhancedConceptHandler,
  }
}

// Hook for first visit detection and modal management
export const useFirstVisitModal = () => {
  const { trackModalOpen, trackModalClose } = useModalAnalytics()

  useEffect(() => {
    const hasVisitedBefore = localStorage.getItem('hasVisitedShallowResearch')
    if (!hasVisitedBefore) {
      trackModalOpen()
    }
  }, [trackModalOpen])

  const handleModalClose = useCallback(
    (method: 'button' | 'overlay' | 'get_started') => {
      trackModalClose(method)
      localStorage.setItem('hasVisitedShallowResearch', 'true')
    },
    [trackModalClose]
  )

  return { handleModalClose }
}

// Combined analytics hook for the main app component
export const useAppAnalytics = () => {
  const modalAnalytics = useModalAnalytics()
  const searchAnalytics = useSearchAnalytics()
  const uiAnalytics = useUIAnalytics()
  const navigationAnalytics = useNavigationAnalytics()
  const firstVisitModal = useFirstVisitModal()

  return {
    modal: modalAnalytics,
    search: searchAnalytics,
    ui: uiAnalytics,
    navigation: navigationAnalytics,
    firstVisit: firstVisitModal,
  }
}
