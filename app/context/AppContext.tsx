'use client'

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
} from 'react'
import {
  appReducer,
  initialState,
  getRandomQuestions,
  type AppState,
  type AppAction,
  type HistoryItem,
} from '../state'
import { useApi } from '../lib/useApi'
import { useAppAnalytics } from '../lib/analytics-hooks'
import { SUGGESTED_QUESTIONS } from '../questions'

// Context interfaces
interface AppContextValue {
  // State
  state: AppState

  // Core actions
  dispatch: React.Dispatch<AppAction>

  // API actions
  handleOpenAI: (
    message: string,
    includeHistory: boolean,
    isFollowUp?: boolean
  ) => Promise<void>
  handleShuffle: () => Promise<void>

  // UI actions with analytics
  handleInputChange: (value: string) => void
  handleConcisenesChange: (value: 'short' | 'medium' | 'long') => void
  handleFollowUpClick: (question: string, index: number) => void
  handleSuggestedQuestionClick: (question: string, index: number) => void
  handleArticleItemClick: (concept: string) => void
  handleThemeToggle: () => void
  handleSidebarToggle: () => void
  handleConcisenessSidebarToggle: () => void

  // History actions
  loadHistoryEntry: (entry: HistoryItem) => void
  handleRevert: (entry: HistoryItem, entryIndex: number) => Promise<void>

  // Modal actions
  handleCloseModal: (method?: 'button' | 'overlay' | 'get_started') => void

  // Analytics (exposed for custom tracking)
  analytics: ReturnType<typeof useAppAnalytics>
}

// Create contexts
const AppContext = createContext<AppContextValue | null>(null)

// Provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(appReducer, initialState)
  const analytics = useAppAnalytics()
  const { handleOpenAI, handleShuffle } = useApi(state, dispatch)

  // Initialize suggested questions on mount
  useEffect(() => {
    dispatch({
      type: 'SET_SUGGESTED_QUESTIONS',
      payload: getRandomQuestions(SUGGESTED_QUESTIONS),
    })
  }, [])

  // Check first visit and show modal
  useEffect(() => {
    const hasVisitedBefore = localStorage.getItem('hasVisitedShallowResearch')
    if (!hasVisitedBefore) {
      dispatch({ type: 'SET_MODAL_VISIBLE', payload: true })
      analytics.modal.trackModalOpen()
    }
  }, [analytics.modal])

  // Enhanced action handlers with analytics
  const handleInputChange = useCallback((value: string) => {
    dispatch({ type: 'SET_INPUT', payload: value })
  }, [])

  const handleConcisenesChange = useCallback(
    (value: 'short' | 'medium' | 'long') => {
      const oldValue = state.conciseness
      dispatch({ type: 'SET_CONCISENESS', payload: value })
      analytics.ui.trackConcisenesChange(oldValue, value)
    },
    [state.conciseness, analytics.ui]
  )

  const handleFollowUpClick = useCallback(
    (question: string, index: number) => {
      analytics.navigation.trackFollowUpClick(question, index)
      handleOpenAI(question, true, true)
    },
    [handleOpenAI, analytics.navigation]
  )

  const handleSuggestedQuestionClick = useCallback(
    (question: string, index: number) => {
      analytics.search.trackSearchStart(question, state.conciseness)
      handleOpenAI(question, false, false)
    },
    [handleOpenAI, state.conciseness, analytics.search]
  )

  const handleArticleItemClick = useCallback(
    (concept: string) => {
      analytics.navigation.trackConceptClick(concept)
      handleOpenAI(concept, true, true)
    },
    [handleOpenAI, analytics.navigation]
  )

  const handleThemeToggle = useCallback(() => {
    const newTheme = state.isDarkMode ? 'light' : 'dark'
    analytics.ui.trackThemeToggle(newTheme)
    dispatch({ type: 'TOGGLE_THEME' })
  }, [state.isDarkMode, analytics.ui])

  const handleSidebarToggle = useCallback(() => {
    dispatch({
      type: 'SET_SIDEBAR_VISIBLE',
      payload: !state.isSidebarVisible,
    })
  }, [state.isSidebarVisible])

  const handleConcisenessSidebarToggle = useCallback(() => {
    dispatch({
      type: 'SET_CONCISENESS_SIDEBAR_VISIBLE',
      payload: !state.isConcisenessSidebarVisible,
    })
  }, [state.isConcisenessSidebarVisible])

  const loadHistoryEntry = useCallback(
    (entry: HistoryItem) => {
      analytics.navigation.trackHistoryClick(entry.queryText)
      dispatch({ type: 'LOAD_HISTORY_ENTRY', payload: entry })
    },
    [analytics.navigation]
  )

  const handleRevert = useCallback(
    async (entry: HistoryItem, entryIndex: number) => {
      const { queryText, conversationHistoryIndex } = entry
      analytics.navigation.trackHistoryRevert(queryText, entryIndex)

      // Truncate conversation history to this point
      const truncatedHistory = state.conversationHistory.slice(
        0,
        conversationHistoryIndex
      )
      dispatch({ type: 'SET_CONVERSATION_HISTORY', payload: truncatedHistory })

      // Remove all history entries after this one
      dispatch({
        type: 'SET_HISTORY_ENTRIES',
        payload: state.historyEntries.slice(entryIndex + 1),
      })

      // Re-run the query with truncated history
      await handleOpenAI(queryText, true, false)
    },
    [
      state.conversationHistory,
      state.historyEntries,
      handleOpenAI,
      analytics.navigation,
    ]
  )

  const handleCloseModal = useCallback(
    (method: 'button' | 'overlay' | 'get_started' = 'overlay') => {
      analytics.modal.trackModalClose(method)
      localStorage.setItem('hasVisitedShallowResearch', 'true')
      dispatch({ type: 'SET_MODAL_VISIBLE', payload: false })
    },
    [analytics.modal]
  )

  // Enhanced shuffle with analytics
  const enhancedHandleShuffle = useCallback(async () => {
    analytics.ui.trackShuffle()
    await handleShuffle()
  }, [handleShuffle, analytics.ui])

  const contextValue: AppContextValue = {
    state,
    dispatch,
    handleOpenAI,
    handleShuffle: enhancedHandleShuffle,
    handleInputChange,
    handleConcisenesChange,
    handleFollowUpClick,
    handleSuggestedQuestionClick,
    handleArticleItemClick,
    handleThemeToggle,
    handleSidebarToggle,
    handleConcisenessSidebarToggle,
    loadHistoryEntry,
    handleRevert,
    handleCloseModal,
    analytics,
  }

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  )
}

// Custom hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}

// Selector hooks for performance (only re-render when specific state changes)
export const useAppState = () => useAppContext().state
export const useAppActions = () => {
  const { dispatch, ...actions } = useAppContext()
  return actions
}

// Specific state selectors
export const useSearchState = () => {
  const {
    result,
    isLoading,
    currentQuery,
    isStreaming,
    displayedText,
    streamBuffer,
  } = useAppState()
  return {
    result,
    isLoading,
    currentQuery,
    isStreaming,
    displayedText,
    streamBuffer,
  }
}

export const useHistoryState = () => {
  const { historyEntries, conversationHistory } = useAppState()
  return { historyEntries, conversationHistory }
}

export const useUIState = () => {
  const {
    isDarkMode,
    isSidebarVisible,
    isModalVisible,
    conciseness,
    isConcisenessSidebarVisible,
  } = useAppState()
  return {
    isDarkMode,
    isSidebarVisible,
    isModalVisible,
    conciseness,
    isConcisenessSidebarVisible,
  }
}

export const useQuestionsState = () => {
  const {
    options,
    suggestedQuestions,
    showSuggestedQuestions,
    explorableConcepts,
  } = useAppState()
  return {
    options,
    suggestedQuestions,
    showSuggestedQuestions,
    explorableConcepts,
  }
}
