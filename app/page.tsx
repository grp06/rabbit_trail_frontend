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
    isDragging,
    isDarkMode,
    isModalVisible,
    showSuggestedQuestions,
    suggestedQuestions,
    isStreaming,
    streamBuffer,
    displayedText,
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

  // Calculate realistic typing delay based on character and context
  const getTypingDelay = useCallback(
    (char: string, previousChar: string = '', index: number = 0) => {
      const baseDelay = 3 // Very fast base speed

      // Longer pauses after sentence-ending punctuation
      if (
        previousChar === '.' ||
        previousChar === '!' ||
        previousChar === '?'
      ) {
        return baseDelay + Math.random() * 8 + 12 // 15-23ms pause after sentences
      }

      // Medium pause after commas, semicolons, colons
      if (
        previousChar === ',' ||
        previousChar === ';' ||
        previousChar === ':'
      ) {
        return baseDelay + Math.random() * 4 + 6 // 9-13ms pause
      }

      // Slight pause after spaces (between words)
      if (previousChar === ' ') {
        return baseDelay + Math.random() * 3 + 2 // 5-8ms pause
      }

      // Occasional micro-hesitations (every 15-25 characters on average)
      if (Math.random() < 0.05) {
        // 5% chance
        return baseDelay + Math.random() * 4 + 3 // 6-10ms micro-pause
      }

      // Regular character with slight randomization
      return baseDelay + Math.random() * 2 // 3-5ms normal speed
    },
    []
  )

  // Typewriter animation effect
  React.useEffect(() => {
    if (!isStreaming || !streamBuffer) return

    const targetText = streamBuffer
    const currentLength = displayedText.length

    if (currentLength < targetText.length) {
      const nextChar = targetText[currentLength]
      const previousChar =
        currentLength > 0 ? targetText[currentLength - 1] : ''

      const timer = setTimeout(() => {
        const newDisplayedText = displayedText + nextChar
        dispatch({ type: 'UPDATE_DISPLAYED_TEXT', payload: newDisplayedText })
      }, getTypingDelay(nextChar, previousChar, currentLength))

      return () => clearTimeout(timer)
    } else if (currentLength === targetText.length && isStreaming) {
      // When typewriter catches up and we're still streaming, sync the result
      dispatch({ type: 'SET_RESULT', payload: displayedText })
    }
  }, [isStreaming, streamBuffer, displayedText, getTypingDelay])

  // Handle smooth transition when streaming stops
  React.useEffect(() => {
    if (
      !isStreaming &&
      streamBuffer &&
      displayedText.length < streamBuffer.length
    ) {
      // Streaming stopped but typewriter hasn't caught up - let it finish
      const nextChar = streamBuffer[displayedText.length]
      const previousChar =
        displayedText.length > 0 ? displayedText[displayedText.length - 1] : ''

      const timer = setTimeout(() => {
        const newDisplayedText = displayedText + nextChar
        dispatch({ type: 'UPDATE_DISPLAYED_TEXT', payload: newDisplayedText })

        // If we've caught up, set the final result
        if (newDisplayedText.length === streamBuffer.length) {
          dispatch({ type: 'SET_RESULT', payload: newDisplayedText })
        }
      }, getTypingDelay(nextChar, previousChar, displayedText.length))

      return () => clearTimeout(timer)
    }
  }, [isStreaming, streamBuffer, displayedText, getTypingDelay])

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

  // Memoized slider position calculation
  const sliderPosition = useMemo(() => {
    switch (conciseness) {
      case 'short':
        return 20
      case 'medium':
        return 50
      case 'long':
        return 80
      default:
        return 20
    }
  }, [conciseness])

  // Memoize the highlight regex to avoid recreating it on every render
  const highlightRegex = useMemo(() => {
    if (explorableConcepts.length === 0) return null
    return new RegExp(`(${explorableConcepts.join('|')})`, 'gi')
  }, [explorableConcepts])

  // Memoize event handlers that depend on handleOpenAI
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

  const handleSliderInteraction = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const { currentTarget, clientX, clientY } = event
      const { left, top, width, height } = currentTarget.getBoundingClientRect()
      const isMobile = window.innerWidth <= 768

      if (isMobile) {
        // Horizontal slider for mobile
        const x = clientX - left
        const percentage = (x / width) * 100

        if (percentage <= 35) {
          dispatch({ type: 'SET_CONCISENESS', payload: 'short' })
        } else if (percentage <= 65) {
          dispatch({ type: 'SET_CONCISENESS', payload: 'medium' })
        } else {
          dispatch({ type: 'SET_CONCISENESS', payload: 'long' })
        }
      } else {
        // Vertical slider for desktop
        const y = clientY - top
        const percentage = (y / height) * 100

        if (percentage <= 35) {
          dispatch({ type: 'SET_CONCISENESS', payload: 'short' })
        } else if (percentage <= 65) {
          dispatch({ type: 'SET_CONCISENESS', payload: 'medium' })
        } else {
          dispatch({ type: 'SET_CONCISENESS', payload: 'long' })
        }
      }
    },
    []
  )

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      dispatch({ type: 'SET_DRAGGING', payload: true })
      handleSliderInteraction(event)
    },
    [handleSliderInteraction]
  )

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (isDragging) {
        handleSliderInteraction(event)
      }
    },
    [isDragging, handleSliderInteraction]
  )

  const handleMouseUp = useCallback(() => {
    dispatch({ type: 'SET_DRAGGING', payload: false })
  }, [])

  const handleMouseLeave = useCallback(() => {
    dispatch({ type: 'SET_DRAGGING', payload: false })
  }, [])

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

        <ConcisenessSidebar>
          <SliderTitle>Detail</SliderTitle>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <SliderLabel
              $isActive={conciseness === 'short'}
              onClick={() =>
                dispatch({ type: 'SET_CONCISENESS', payload: 'short' })
              }
            >
              Short
            </SliderLabel>
            <SliderContainer
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
            >
              <SliderTrack />
              <SliderThumb $position={sliderPosition} />
            </SliderContainer>
            <SliderLabel
              $isActive={conciseness === 'long'}
              onClick={() =>
                dispatch({ type: 'SET_CONCISENESS', payload: 'long' })
              }
            >
              Long
            </SliderLabel>
          </div>
        </ConcisenessSidebar>

        <MobileOverlay
          $isVisible={isSidebarVisible}
          onClick={() =>
            dispatch({ type: 'SET_SIDEBAR_VISIBLE', payload: false })
          }
        />

        <Sidebar $isVisible={isSidebarVisible}>
          {/* History entries */}
          {historyEntries.map((entry, index) => {
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
          })}
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

          {options.length > 0 && !isLoading && (
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
