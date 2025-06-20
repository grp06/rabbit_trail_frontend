'use client'

import React, { useState, useReducer, useCallback, useMemo } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faShuffle,
  faMoon,
  faSun,
  faBars,
} from '@fortawesome/free-solid-svg-icons'
import { ThemeProvider, createGlobalStyle } from 'styled-components'
import { API_ENDPOINTS } from './config'
import { useAppAnalytics } from './lib/analytics-hooks'
import { SUGGESTED_QUESTIONS } from './questions'
import {
  appReducer,
  initialState,
  getRandomQuestions,
  type HistoryItem,
} from './state'
import { useApi } from './lib/useApi'
import { ConcisenessSlider } from './components/ConcisenessSlider'
import { useTypewriter } from './lib/useTypewriter'

import {
  AppContainer,
  Sidebar,
  MainContainer,
  InputContainer,
  CenteredInput,
  Result,
  CurrentQuery,
  ButtonContainer,
  FollowUpButton,
  ShuffleButton,
  HighlightedText,
  HistoryEntry,
  HistoryQuery,
  RevertButton,
  ConcisenessSidebar,
  SliderContainer,
  SliderTrack,
  SliderThumb,
  SliderLabel,
  SliderTitle,
  NavigationHeader,
  NavigationContainer,
  Logo,
  NavigationLinks,
  NavigationLink,
  MobileMenuButton,
  LoadingIndicator,
  StreamingIndicator,
  StreamingContainer,
  TypewriterText,
  ThemeToggle,
  ThemeIcon,
  ModalOverlay,
  ModalContainer,
  ModalCloseButton,
  ModalTitle,
  ModalContent,
  ModalFeatureList,
  ModalButton,
  MobileOverlay,
  lightTheme,
  darkTheme,
} from './StyledComponents'

// Global styles
const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    background-color: #1e1e1e;
    color: #e0e0e0;
    font-family: var(--font-space-grotesk), 'Comic Sans MS', 'Comic Sans', cursive, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
`

export default function Home() {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Destructure state for easier access
  const {
    inputText,
    result,
    options,
    conversationHistory,
    explorableConcepts,
    isLoading,
    isSidebarVisible,
    historyEntries,
    currentQuery,
    conciseness,
    isDarkMode,
    isModalVisible,
    showSuggestedQuestions,
    suggestedQuestions,
    isStreaming,
    streamBuffer,
    displayedText,
    isTypewriterDone,
  } = state

  // Analytics hooks
  const analytics = useAppAnalytics()
  const {
    trackModalOpen,
    trackModalClose,
    trackSearchStart,
    trackSearchComplete,
    trackSearchError,
    trackConcisenesChange,
    trackThemeToggle,
    trackShuffle,
    trackFollowUpClick,
    trackConceptClick,
    trackHistoryClick,
    trackHistoryRevert,
  } = {
    ...analytics.modal,
    ...analytics.search,
    ...analytics.ui,
    ...analytics.navigation,
  }

  const { handleOpenAI, handleShuffle } = useApi(state, dispatch)

  // Typewriter animation hook
  useTypewriter({
    isStreaming,
    streamBuffer,
    displayedText,
    dispatch,
  })

  // Initialize suggested questions on component mount
  React.useEffect(() => {
    dispatch({
      type: 'SET_SUGGESTED_QUESTIONS',
      payload: getRandomQuestions(SUGGESTED_QUESTIONS),
    })
  }, [])

  // Check if this is the user's first visit
  React.useEffect(() => {
    const hasVisitedBefore = localStorage.getItem('hasVisitedShallowResearch')
    if (!hasVisitedBefore) {
      dispatch({ type: 'SET_MODAL_VISIBLE', payload: true })
      trackModalOpen()
    }
  }, [trackModalOpen])

  // Memoized callbacks to prevent recreation on every render
  const handleInputChange = useCallback(
    ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
      dispatch({ type: 'SET_INPUT', payload: value })
    },
    []
  )

  const handleConcisenesChange = useCallback(
    (value: 'short' | 'medium' | 'long') => {
      const oldValue = conciseness
      dispatch({ type: 'SET_CONCISENESS', payload: value })
      trackConcisenesChange(oldValue, value)
    },
    [conciseness, trackConcisenesChange]
  )

  // Memoize the highlight regex to avoid recreating it on every render
  const highlightRegex = useMemo(() => {
    if (explorableConcepts.length === 0) return null
    return new RegExp(`(${explorableConcepts.join('|')})`, 'gi')
  }, [explorableConcepts])

  // Memoized event handlers that depend on handleOpenAI
  const handleFollowUpClick = useCallback(
    (question: string, index: number) => {
      trackFollowUpClick(question, index)
      handleOpenAI(question, true, true)
    },
    [handleOpenAI, trackFollowUpClick]
  )

  const handleSuggestedQuestionClick = useCallback(
    (question: string, index: number) => {
      trackSearchStart(question, conciseness)
      handleOpenAI(question, false, false)
    },
    [handleOpenAI, conciseness, trackSearchStart]
  )

  const handleArticleItemClick = useCallback(
    (concept: string) => {
      trackConceptClick(concept)
      handleOpenAI(concept, true, true)
    },
    [handleOpenAI, trackConceptClick]
  )

  // Optimized renderResultWithHighlights using memoization
  const renderResultWithHighlights = useCallback(
    (text: string, highlights: string[]) => {
      if (!text) return null

      // If no highlights yet, wrap potential highlight words in spans to reserve space
      if (highlights.length === 0) {
        // Split by word boundaries but keep the delimiters
        const words = text.split(/(\s+)/)
        return words.map((word, index) => {
          // Check if this is a whitespace
          if (/^\s+$/.test(word)) {
            return word
          }
          // Wrap non-whitespace words in spans to maintain consistent rendering
          return (
            <span key={index} style={{ display: 'inline' }}>
              {word}
            </span>
          )
        })
      }

      const parts = highlightRegex ? text.split(highlightRegex) : [text]
      return parts.map((part, index) =>
        highlights.some((h) => h.toLowerCase() === part.toLowerCase()) ? (
          <HighlightedText
            key={index}
            onClick={() => handleArticleItemClick(part)}
          >
            {part}
          </HighlightedText>
        ) : (
          part
        )
      )
    },
    [highlightRegex, handleArticleItemClick]
  )

  const loadHistoryEntry = useCallback(
    (entry: HistoryItem) => {
      const { queryText } = entry
      trackHistoryClick(queryText)
      dispatch({ type: 'LOAD_HISTORY_ENTRY', payload: entry })
    },
    [trackHistoryClick]
  )

  // Memoize the submit handler
  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (!inputText.trim()) return
      handleOpenAI(inputText, false, false)
      dispatch({ type: 'SET_INPUT', payload: '' })
    },
    [inputText, handleOpenAI]
  )

  // Memoize handleRevert
  const handleRevert = useCallback(
    async (
      { queryText, conversationHistoryIndex }: HistoryItem,
      entryIndex: number
    ) => {
      trackHistoryRevert(queryText, entryIndex)

      // Truncate conversation history to this point
      const truncatedHistory = conversationHistory.slice(
        0,
        conversationHistoryIndex
      )
      dispatch({ type: 'SET_CONVERSATION_HISTORY', payload: truncatedHistory })

      // Remove all history entries after this one
      dispatch({
        type: 'SET_HISTORY_ENTRIES',
        payload: historyEntries.slice(entryIndex + 1),
      })

      // Re-run the query with truncated history
      await handleOpenAI(queryText, true, false)
    },
    [conversationHistory, historyEntries, handleOpenAI, trackHistoryRevert]
  )

  // Modal handlers
  const handleCloseModal = useCallback(() => {
    trackModalClose('overlay')
    localStorage.setItem('hasVisitedShallowResearch', 'true')
    dispatch({ type: 'SET_MODAL_VISIBLE', payload: false })
  }, [trackModalClose])

  const handleCloseModalButton = useCallback(() => {
    trackModalClose('button')
    localStorage.setItem('hasVisitedShallowResearch', 'true')
    dispatch({ type: 'SET_MODAL_VISIBLE', payload: false })
  }, [trackModalClose])

  const handleGetStarted = useCallback(() => {
    trackModalClose('get_started')
    localStorage.setItem('hasVisitedShallowResearch', 'true')
    dispatch({ type: 'SET_MODAL_VISIBLE', payload: false })
  }, [trackModalClose])

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <GlobalStyle />
      <AppContainer>
        <NavigationHeader>
          <NavigationContainer>
            <Logo>Shallow Research</Logo>
            <NavigationLinks>
              <MobileMenuButton
                onClick={() =>
                  dispatch({
                    type: 'SET_SIDEBAR_VISIBLE',
                    payload: !isSidebarVisible,
                  })
                }
              >
                <FontAwesomeIcon icon={faBars} />
              </MobileMenuButton>
            </NavigationLinks>
          </NavigationContainer>
        </NavigationHeader>

        <ConcisenessSlider
          conciseness={conciseness}
          onConcisenessChange={handleConcisenesChange}
        />

        <MobileOverlay
          $isVisible={isSidebarVisible}
          onClick={() =>
            dispatch({ type: 'SET_SIDEBAR_VISIBLE', payload: false })
          }
        />

        <Sidebar $isVisible={isSidebarVisible}>
          {/* History entries */}
          {historyEntries.length > 0 ? (
            historyEntries.map((entry, index) => {
              const { queryText } = entry
              return (
                <HistoryEntry key={index}>
                  <HistoryQuery onClick={() => loadHistoryEntry(entry)}>
                    {queryText}
                  </HistoryQuery>
                  <RevertButton onClick={() => handleRevert(entry, index)}>
                    Revert
                  </RevertButton>
                </HistoryEntry>
              )
            })
          ) : (
            <div
              style={{
                padding: '20px',
                textAlign: 'center',
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '14px',
                lineHeight: '1.5',
              }}
            >
              <div style={{ fontSize: '16px', marginBottom: '10px' }}>
                🔍 Search History
              </div>
              <div>
                Your research trail will appear here as you explore rabbit
                holes.
              </div>
              <div
                style={{
                  marginTop: '15px',
                  fontSize: '13px',
                  fontStyle: 'italic',
                }}
              >
                Ask a question to get started!
              </div>
            </div>
          )}
        </Sidebar>

        <MainContainer>
          <InputContainer>
            <form
              onSubmit={handleSubmit}
              style={{ display: 'flex', width: '100%' }}
            >
              <CenteredInput
                type="text"
                placeholder="Ask a question..."
                value={inputText}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              <button type="submit" style={{ display: 'none' }} />
            </form>
          </InputContainer>

          {/* Suggested Questions - only show when no query/result and not loading */}
          {showSuggestedQuestions && !currentQuery && !result && !isLoading && (
            <ButtonContainer>
              {suggestedQuestions.map((question, index) => (
                <FollowUpButton
                  key={index}
                  onClick={() => handleSuggestedQuestionClick(question, index)}
                  style={{ '--index': index } as React.CSSProperties}
                >
                  {question}
                </FollowUpButton>
              ))}
            </ButtonContainer>
          )}

          {currentQuery && (result || isLoading) && (
            <CurrentQuery>{currentQuery}</CurrentQuery>
          )}

          {(result || isLoading || isStreaming) && (
            <Result>
              <StreamingContainer>
                {isLoading && !result && !isStreaming ? (
                  <LoadingIndicator>
                    Thinking
                    <span></span>
                    <span></span>
                    <span></span>
                  </LoadingIndicator>
                ) : (
                  <>
                    {isStreaming ||
                    (streamBuffer &&
                      displayedText.length < streamBuffer.length) ? (
                      <TypewriterText>
                        {renderResultWithHighlights(
                          displayedText,
                          explorableConcepts
                        )}
                        {isStreaming && <StreamingIndicator />}
                      </TypewriterText>
                    ) : (
                      renderResultWithHighlights(result, explorableConcepts)
                    )}
                  </>
                )}
              </StreamingContainer>
            </Result>
          )}

          {options.length > 0 && !isLoading && isTypewriterDone && (
            <>
              <ButtonContainer>
                {options.map((option, index) => (
                  <FollowUpButton
                    key={index}
                    onClick={() => handleFollowUpClick(option, index)}
                    style={{ '--index': index } as React.CSSProperties}
                  >
                    {option}
                  </FollowUpButton>
                ))}
              </ButtonContainer>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginTop: '20px',
                }}
              >
                <ShuffleButton onClick={handleShuffle} disabled={isLoading}>
                  <FontAwesomeIcon
                    icon={faShuffle}
                    style={{ marginRight: '8px' }}
                  />
                  Shuffle Questions
                </ShuffleButton>
              </div>
            </>
          )}
        </MainContainer>

        <ThemeToggle
          onClick={() => {
            const newTheme = isDarkMode ? 'light' : 'dark'
            trackThemeToggle(newTheme)
            dispatch({ type: 'TOGGLE_THEME' })
          }}
        >
          <ThemeIcon $isVisible={isDarkMode}>
            <FontAwesomeIcon icon={faMoon} />
          </ThemeIcon>
          <ThemeIcon $isVisible={!isDarkMode}>
            <FontAwesomeIcon icon={faSun} />
          </ThemeIcon>
        </ThemeToggle>

        <ModalOverlay $isVisible={isModalVisible} onClick={handleCloseModal}>
          <ModalContainer
            $isVisible={isModalVisible}
            onClick={(e) => e.stopPropagation()}
          >
            <ModalCloseButton onClick={handleCloseModalButton}>
              ×
            </ModalCloseButton>

            <ModalTitle>Welcome to Shallow Research</ModalTitle>

            <ModalContent>
              Your AI research sidekick for fast, focused insights.
            </ModalContent>

            <ModalFeatureList>
              <li style={{ '--index': 0 } as React.CSSProperties}>
                Ask anything. Get clear, simple answers.
              </li>
              <li style={{ '--index': 1 } as React.CSSProperties}>
                Follow smart follow-ups to dive deeper.
              </li>
              <li style={{ '--index': 2 } as React.CSSProperties}>
                Tap highlighted terms to learn instantly.
              </li>
              <li style={{ '--index': 3 } as React.CSSProperties}>
                Slide to adjust detail, from bite-sized to in-depth.
              </li>
              <li style={{ '--index': 4 } as React.CSSProperties}>
                See your research trail in the sidebar.
              </li>
            </ModalFeatureList>

            <ModalButton onClick={handleGetStarted}>
              Start Exploring
            </ModalButton>
          </ModalContainer>
        </ModalOverlay>
      </AppContainer>
    </ThemeProvider>
  )
}
