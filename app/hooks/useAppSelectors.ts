import { useMemo } from 'react'
import { useAppState } from '../context/AppContext'
import type { AppState } from '../state'

// Memoized selectors to prevent unnecessary re-renders
export const useInputState = () => {
  const state = useAppState()
  return useMemo(
    () => ({
      inputText: state.inputText,
      isLoading: state.isLoading,
    }),
    [state.inputText, state.isLoading]
  )
}

export const useSearchResults = () => {
  const state = useAppState()
  return useMemo(
    () => ({
      result: state.result,
      currentQuery: state.currentQuery,
      isLoading: state.isLoading,
      isStreaming: state.isStreaming,
      displayedText: state.displayedText,
      streamBuffer: state.streamBuffer,
      isTypewriterDone: state.isTypewriterDone,
    }),
    [
      state.result,
      state.currentQuery,
      state.isLoading,
      state.isStreaming,
      state.displayedText,
      state.streamBuffer,
      state.isTypewriterDone,
    ]
  )
}

export const useQuestionOptions = () => {
  const state = useAppState()
  return useMemo(
    () => ({
      options: state.options,
      suggestedQuestions: state.suggestedQuestions,
      showSuggestedQuestions: state.showSuggestedQuestions,
      explorableConcepts: state.explorableConcepts,
    }),
    [
      state.options,
      state.suggestedQuestions,
      state.showSuggestedQuestions,
      state.explorableConcepts,
    ]
  )
}

export const useHistoryData = () => {
  const state = useAppState()
  return useMemo(
    () => ({
      historyEntries: state.historyEntries,
      conversationHistory: state.conversationHistory,
    }),
    [state.historyEntries, state.conversationHistory]
  )
}

export const useUISettings = () => {
  const state = useAppState()
  return useMemo(
    () => ({
      isDarkMode: state.isDarkMode,
      isSidebarVisible: state.isSidebarVisible,
      isModalVisible: state.isModalVisible,
      conciseness: state.conciseness,
      isDragging: state.isDragging,
    }),
    [
      state.isDarkMode,
      state.isSidebarVisible,
      state.isModalVisible,
      state.conciseness,
      state.isDragging,
    ]
  )
}

// Computed selectors
export const useCanShowSuggestedQuestions = () => {
  const state = useAppState()
  return useMemo(
    () =>
      state.showSuggestedQuestions &&
      !state.currentQuery &&
      !state.result &&
      !state.isLoading,
    [
      state.showSuggestedQuestions,
      state.currentQuery,
      state.result,
      state.isLoading,
    ]
  )
}

export const useCanShowFollowUps = () => {
  const state = useAppState()
  return useMemo(
    () =>
      state.options.length > 0 && !state.isLoading && state.isTypewriterDone,
    [state.options.length, state.isLoading, state.isTypewriterDone]
  )
}

export const useCanShowResult = () => {
  const state = useAppState()
  return useMemo(
    () =>
      state.currentQuery &&
      (state.result || state.isLoading || state.isStreaming),
    [state.currentQuery, state.result, state.isLoading, state.isStreaming]
  )
}

// Utility selector for theme
export const useTheme = () => {
  const state = useAppState()
  return useMemo(
    () => ({
      isDarkMode: state.isDarkMode,
      theme: state.isDarkMode ? 'dark' : 'light',
    }),
    [state.isDarkMode]
  )
}
