// Google Analytics event tracking utilities

export const trackEvent = (
  eventName: string,
  parameters?: Record<string, any>
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      ...parameters,
      // Add some default parameters
      timestamp: new Date().toISOString(),
    })
  }
}

// Specific event tracking functions
export const analytics = {
  // Search and query events
  searchQuery: (query: string, conciseness: string) => {
    trackEvent('search_query', {
      search_term: query,
      detail_level: conciseness,
      event_category: 'engagement',
    })
  },

  followUpClick: (question: string, questionIndex: number) => {
    trackEvent('follow_up_click', {
      question_text: question,
      question_position: questionIndex,
      event_category: 'engagement',
    })
  },

  conceptClick: (concept: string) => {
    trackEvent('concept_click', {
      concept_name: concept,
      event_category: 'engagement',
    })
  },

  shuffleQuestions: () => {
    trackEvent('shuffle_questions', {
      event_category: 'engagement',
    })
  },

  // UI interaction events
  concisenesChange: (oldLevel: string, newLevel: string) => {
    trackEvent('conciseness_change', {
      from_level: oldLevel,
      to_level: newLevel,
      event_category: 'ui_interaction',
    })
  },

  themeToggle: (newTheme: string) => {
    trackEvent('theme_toggle', {
      theme: newTheme,
      event_category: 'ui_interaction',
    })
  },

  sidebarToggle: (isVisible: boolean) => {
    trackEvent('sidebar_toggle', {
      action: isVisible ? 'open' : 'close',
      event_category: 'ui_interaction',
    })
  },

  // History and navigation events
  historyEntryClick: (queryText: string) => {
    trackEvent('history_entry_click', {
      query_text: queryText,
      event_category: 'navigation',
    })
  },

  revertToHistory: (queryText: string, entryIndex: number) => {
    trackEvent('revert_to_history', {
      query_text: queryText,
      entry_position: entryIndex,
      event_category: 'navigation',
    })
  },

  // Modal events
  modalOpen: () => {
    trackEvent('welcome_modal_open', {
      event_category: 'onboarding',
    })
  },

  modalClose: (method: 'button' | 'overlay' | 'get_started') => {
    trackEvent('welcome_modal_close', {
      close_method: method,
      event_category: 'onboarding',
    })
  },

  // Error tracking
  apiError: (endpoint: string, errorMessage: string) => {
    trackEvent('api_error', {
      endpoint: endpoint,
      error_message: errorMessage,
      event_category: 'error',
    })
  },

  // Performance tracking
  responseTime: (queryLength: number, responseTime: number) => {
    trackEvent('response_time', {
      query_length: queryLength,
      response_time_ms: responseTime,
      event_category: 'performance',
    })
  },
}
