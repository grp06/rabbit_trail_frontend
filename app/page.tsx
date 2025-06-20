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
import { analytics } from './lib/analytics'

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

// 64 unusual and intriguing questions from various topics
const SUGGESTED_QUESTIONS = [
  // History
  'Why did the Byzantine Emperor once ban the use of forks because he thought they were devil instruments?',
  'How did a dead Pope get put on trial in 897 AD and what were the charges?',
  'Why did the CIA try to use cats as living surveillance devices in the 1960s?',
  'What happened to the 40,000 tons of human hair the Nazis collected during WWII?',
  'Why did the Roman Emperor Caligula declare war on Neptune and order his soldiers to stab the ocean?',
  'How did a dancing plague in 1518 cause hundreds of people to literally dance themselves to death?',
  'Why did the Australian military lose a war against emus in 1932 and what were the casualties?',
  'What really happened to the 9th Roman Legion that just vanished into thin air in Scotland?',

  // Science & Technology
  'Why does the Antikythera Mechanism from ancient Greece contain computer-like gears that predict eclipses?',
  'What happens if you put a grape in the microwave and why does it create plasma?',
  'How did a computer programmer accidentally create the first computer worm by trying to measure the internet?',
  'Why can humans tickle other people but never successfully tickle themselves?',
  'Why does the Bloop sound recorded in the Pacific Ocean remain one of the loudest sounds ever detected?',
  'Why do some people see sounds as colors and how many senses do humans actually have?',
  'How did the ancient Romans create concrete that still stands today while modern concrete crumbles?',
  'Why do quantum particles seem to "know" when they are being observed and change their behavior?',

  // Biology & Medicine
  'Why do some people sneeze uncontrollably when they look at bright lights?',
  'How many bugs do you actually eat per year without knowing it?',
  'Why does your foot fall asleep and what are those pins and needles really doing?',
  'Why do people with foreign accent syndrome wake up speaking in completely different accents after brain injuries?',
  'Why do dead bodies sometimes sit up and move around in morgues?',
  'How did doctors in the 1800s accidentally cure depression by giving patients malaria?',
  'Why do some people wake up during surgery and what do they actually experience?',
  'How many bacteria are having sex on your skin right now and should you be worried?',

  // Psychology & Human Behavior
  'Why do people see Jesus in toast but struggle to recognize faces sometimes?',
  "How do people born blind experience nightmares if they've never seen anything scary?",
  'Why do some people compulsively eat ice cubes and what does their brain crave?',
  'What actually happens in your mind when someone says "don\'t think of a pink elephant"?',
  'Why do people get sexually attracted to objects like cars and buildings?',
  'What happens in your brain when you get a song stuck on repeat for days?',
  'Why do some people genuinely believe they are dead and how do you convince them otherwise?',
  'What makes identical twins develop completely different personalities when they share the same DNA?',

  // Economics & Society
  'Why did tulip bulbs once cost more than luxury houses in Amsterdam?',
  'How did a secretary accidentally crash the entire stock market by typing "billion" instead of "million" in 2013?',
  "How much money is currently hidden in people's mattresses around the world?",
  'Why do some Pacific islands still use giant stone wheels as legal currency?',
  'Why did Japan have a economic bubble where golf club memberships cost more than houses?',
  'Why do people pay thousands of dollars for water that tastes exactly like tap water?',
  'How much does it actually cost to make a penny and why do we keep making them?',
  'How did tulip mania create the first recorded economic bubble and market crash in history?',

  // Environment & Climate
  'Why do flamingos stand on one leg and how do they sleep without falling over?',
  "How do plants actually scream when they're being eaten and who first heard them?",
  'Why did the Carrington Event in 1859 cause telegraph wires to spark and catch fire worldwide?',
  'Why do some trees live for 5,000 years while others die after one bad weekend?',
  'Why do cats bring you dead animals as gifts and what are they actually trying to tell you?',
  'What happens when you play music to plants and do they actually have favorite genres?',
  'Why do penguins have a specific rock they use as currency for mating rituals?',
  'How do mushrooms secretly control the minds of insects to create zombie armies?',

  // Space & Astronomy
  'What happens if you cry in space and where do your tears actually go?',
  'Why does outer space smell exactly like hot metal and burnt steak?',
  'How do astronauts handle the psychological effects of seeing Earth as a tiny blue dot?',
  'How do astronauts deal with their hair constantly floating into their food?',
  'Why do space suits have a built-in system for astronauts to pee and how does it work?',
  'Why is there a giant cloud of alcohol floating in space and how much would it take to get drunk?',
  'How did the Wow! Signal in 1977 potentially detect alien communication and why has it never repeated?',
  'How many dead bodies are currently floating around in space and whose are they?',

  // Philosophy & Ethics
  'If you gradually replace every part of a ship, at what point does it stop being the same ship?',
  'Why do we say "after dark" when it\'s technically after light disappears?',
  "What color is a mirror actually, and why do most people think it's silver?",
  'How did the Stanford Prison Experiment reveal the dark side of human nature in just 6 days?',
  'What happens to your consciousness during general anesthesia and where does "you" actually go?',
  'Why did the ancient Greeks believe that the heart was the center of intelligence instead of the brain?',
  'Why do we call it "falling asleep" when we clearly lie down on purpose?',
  'How did the Trolley Problem become the most famous ethical dilemma and what does it reveal about morality?',
]

interface HistoryItem {
  queryText: string
  responseText: string
  suggestedFollowups: string[]
  explorableConcepts: string[]
  conversationHistoryIndex: number // Position in conversation history when this query was made
}

// Consolidated state interface
interface AppState {
  inputText: string
  result: string
  options: string[]
  conversationHistory: Array<{ role: string; content: string }>
  explorableConcepts: string[]
  isLoading: boolean
  isSidebarVisible: boolean
  historyEntries: HistoryItem[]
  currentQuery: string
  conciseness: 'short' | 'medium' | 'long'
  isDragging: boolean
  isDarkMode: boolean
  isModalVisible: boolean
  showSuggestedQuestions: boolean
  suggestedQuestions: string[]
}

// Action types
type AppAction =
  | { type: 'SET_INPUT'; payload: string }
  | { type: 'SET_RESULT'; payload: string }
  | { type: 'SET_OPTIONS'; payload: string[] }
  | { type: 'SET_EXPLORABLE_CONCEPTS'; payload: string[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SIDEBAR_VISIBLE'; payload: boolean }
  | { type: 'ADD_HISTORY_ENTRY'; payload: HistoryItem }
  | { type: 'SET_HISTORY_ENTRIES'; payload: HistoryItem[] }
  | { type: 'SET_CURRENT_QUERY'; payload: string }
  | { type: 'SET_CONCISENESS'; payload: 'short' | 'medium' | 'long' }
  | { type: 'SET_DRAGGING'; payload: boolean }
  | { type: 'TOGGLE_THEME' }
  | { type: 'SET_MODAL_VISIBLE'; payload: boolean }
  | { type: 'HIDE_SUGGESTED_QUESTIONS' }
  | { type: 'SET_SUGGESTED_QUESTIONS'; payload: string[] }
  | {
      type: 'ADD_CONVERSATION_HISTORY'
      payload: { role: string; content: string }[]
    }
  | {
      type: 'SET_CONVERSATION_HISTORY'
      payload: Array<{ role: string; content: string }>
    }
  | { type: 'LOAD_HISTORY_ENTRY'; payload: HistoryItem }
  | { type: 'RESET_QUERY_STATE' }

// Function to shuffle array and pick random questions
function getRandomQuestions(questions: string[], count: number = 6): string[] {
  const shuffled = [...questions].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

// Reducer function
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_INPUT':
      return {
        ...state,
        inputText: action.payload,
        // Hide suggested questions when user starts typing
        showSuggestedQuestions:
          action.payload.trim() === '' ? state.showSuggestedQuestions : false,
      }
    case 'SET_RESULT':
      return { ...state, result: action.payload }
    case 'SET_OPTIONS':
      return { ...state, options: action.payload }
    case 'SET_EXPLORABLE_CONCEPTS':
      return { ...state, explorableConcepts: action.payload }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_SIDEBAR_VISIBLE':
      return { ...state, isSidebarVisible: action.payload }
    case 'ADD_HISTORY_ENTRY':
      return {
        ...state,
        historyEntries: [action.payload, ...state.historyEntries],
        // Only auto-open sidebar on desktop (screen width > 768px)
        isSidebarVisible:
          typeof window !== 'undefined' && window.innerWidth > 768
            ? true
            : state.isSidebarVisible,
      }
    case 'SET_HISTORY_ENTRIES':
      return { ...state, historyEntries: action.payload }
    case 'SET_CURRENT_QUERY':
      return { ...state, currentQuery: action.payload }
    case 'SET_CONCISENESS':
      return { ...state, conciseness: action.payload }
    case 'SET_DRAGGING':
      return { ...state, isDragging: action.payload }
    case 'TOGGLE_THEME':
      return { ...state, isDarkMode: !state.isDarkMode }
    case 'SET_MODAL_VISIBLE':
      return { ...state, isModalVisible: action.payload }
    case 'HIDE_SUGGESTED_QUESTIONS':
      return { ...state, showSuggestedQuestions: false }
    case 'SET_SUGGESTED_QUESTIONS':
      return { ...state, suggestedQuestions: action.payload }
    case 'ADD_CONVERSATION_HISTORY':
      return {
        ...state,
        conversationHistory: [...state.conversationHistory, ...action.payload],
      }
    case 'SET_CONVERSATION_HISTORY':
      return { ...state, conversationHistory: action.payload }
    case 'LOAD_HISTORY_ENTRY':
      return {
        ...state,
        currentQuery: action.payload.queryText,
        result: action.payload.responseText,
        options: action.payload.suggestedFollowups,
        explorableConcepts: action.payload.explorableConcepts,
      }
    case 'RESET_QUERY_STATE':
      return {
        ...state,
        result: '',
        options: [],
        explorableConcepts: [],
      }
    default:
      return state
  }
}

// Initial state
const initialState: AppState = {
  inputText: '',
  result: '',
  options: [],
  conversationHistory: [],
  explorableConcepts: [],
  isLoading: false,
  isSidebarVisible: false,
  historyEntries: [],
  currentQuery: '',
  conciseness: 'short',
  isDragging: false,
  isDarkMode: true,
  isModalVisible: false,
  showSuggestedQuestions: true,
  suggestedQuestions: [], // Start with empty array to avoid hydration mismatch
}

export default function Home() {
  const [state, dispatch] = useReducer(appReducer, initialState)

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
      analytics.modalOpen()
    }
  }, [])

  // Memoized callbacks to prevent recreation on every render
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch({ type: 'SET_INPUT', payload: e.target.value })
    },
    []
  )

  const handleConcisenesChange = useCallback(
    (value: 'short' | 'medium' | 'long') => {
      const oldValue = state.conciseness
      dispatch({ type: 'SET_CONCISENESS', payload: value })
      analytics.concisenesChange(oldValue, value)
    },
    [state.conciseness]
  )

  // Memoized slider position calculation
  const sliderPosition = useMemo(() => {
    switch (state.conciseness) {
      case 'short':
        return 20
      case 'medium':
        return 50
      case 'long':
        return 80
      default:
        return 20
    }
  }, [state.conciseness])

  // Memoize the highlight regex to avoid recreating it on every render
  const highlightRegex = useMemo(() => {
    if (state.explorableConcepts.length === 0) return null
    return new RegExp(`(${state.explorableConcepts.join('|')})`, 'gi')
  }, [state.explorableConcepts])

  // Extract streaming logic to a separate function
  const processStreamResponse = useCallback(
    async (reader: ReadableStreamDefaultReader<Uint8Array>) => {
      const decoder = new TextDecoder()
      let buffer = ''
      let finalResponse: any = null
      let streamedResult = ''

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          buffer += chunk

          // Process complete SSE messages
          const lines = buffer.split('\n\n')
          buffer = lines.pop() || '' // Keep incomplete message in buffer

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataContent = line.slice(6).trim()

              if (!dataContent || dataContent === '[DONE]') {
                continue
              }

              try {
                const data = JSON.parse(dataContent)

                switch (data.type) {
                  case 'text_delta':
                    streamedResult += data.content
                    dispatch({ type: 'SET_RESULT', payload: streamedResult })
                    break

                  case 'complete':
                    finalResponse = data.data
                    if (
                      Math.abs(
                        streamedResult.length - data.data.answer.length
                      ) > 10
                    ) {
                      dispatch({
                        type: 'SET_RESULT',
                        payload: data.data.answer,
                      })
                    }
                    dispatch({
                      type: 'SET_OPTIONS',
                      payload: data.data.options || [],
                    })
                    dispatch({
                      type: 'SET_EXPLORABLE_CONCEPTS',
                      payload: data.data.explorable_concepts || [],
                    })
                    break

                  case 'error':
                    console.error('Stream error:', data.message)
                    dispatch({
                      type: 'SET_RESULT',
                      payload: 'Error: ' + data.message,
                    })
                    break

                  case 'end':
                    break
                }
              } catch (parseError) {
                console.warn('Failed to parse SSE data:', dataContent)
              }
            }
          }
        }
      } catch (error) {
        // Silently handle read errors which often occur when connection is closed
        if (error instanceof Error && error.name !== 'AbortError') {
          console.debug(
            'Stream read error (likely connection closed):',
            error.message
          )
        }
      } finally {
        try {
          reader.releaseLock()
        } catch (e) {
          // Ignore errors when releasing lock
        }
      }

      return { finalResponse, streamedResult }
    },
    []
  )

  const handleOpenAI = useCallback(
    async (
      message: string,
      includeHistory: boolean,
      isFollowUp: boolean = false
    ) => {
      // Hide suggested questions when starting a search
      dispatch({ type: 'HIDE_SUGGESTED_QUESTIONS' })

      // Track the search query
      analytics.searchQuery(message, state.conciseness)
      const startTime = Date.now()

      // If this is a follow-up and we have a current result, save it to history
      if (isFollowUp && state.result && state.currentQuery) {
        const newHistoryEntry: HistoryItem = {
          queryText: state.currentQuery,
          responseText: state.result,
          suggestedFollowups: state.options,
          explorableConcepts: state.explorableConcepts,
          conversationHistoryIndex: state.conversationHistory.length,
        }
        dispatch({ type: 'ADD_HISTORY_ENTRY', payload: newHistoryEntry })
      }

      dispatch({ type: 'SET_CURRENT_QUERY', payload: message })
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'RESET_QUERY_STATE' })

      try {
        const response = await fetch(API_ENDPOINTS.openai, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: message,
            conversation_history: includeHistory
              ? state.conversationHistory
              : [],
            conciseness: state.conciseness,
          }),
        })

        if (!response.ok) {
          throw new Error('Network response was not ok')
        }

        const reader = response.body?.getReader()
        if (!reader) {
          throw new Error('No response body')
        }

        const { finalResponse, streamedResult } = await processStreamResponse(
          reader
        )

        // Update conversation history
        const finalResultText = finalResponse?.answer || streamedResult
        if (finalResultText) {
          dispatch({
            type: 'ADD_CONVERSATION_HISTORY',
            payload: [
              { role: 'user', content: message },
              { role: 'assistant', content: finalResultText },
            ],
          })

          // Track response time
          const responseTime = Date.now() - startTime
          analytics.responseTime(message.length, responseTime)
        }
      } catch (error) {
        console.error('Error:', error)
        // Track API errors
        analytics.apiError(
          '/api/openai',
          error instanceof Error ? error.message : 'Unknown error'
        )
        dispatch({ type: 'SET_RESULT', payload: 'Error: Something went wrong' })
        dispatch({ type: 'SET_OPTIONS', payload: [] })
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    },
    [state, processStreamResponse]
  )

  // Memoize event handlers that depend on handleOpenAI
  const handleFollowUpClick = useCallback(
    (question: string, index: number) => {
      analytics.followUpClick(question, index)
      handleOpenAI(question, true, true)
    },
    [handleOpenAI]
  )

  const handleSuggestedQuestionClick = useCallback(
    (question: string, index: number) => {
      analytics.searchQuery(question, state.conciseness)
      handleOpenAI(question, false, false)
    },
    [handleOpenAI, state.conciseness]
  )

  const handleArticleItemClick = useCallback(
    (concept: string) => {
      analytics.conceptClick(concept)
      handleOpenAI(concept, true, true)
    },
    [handleOpenAI]
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

  const loadHistoryEntry = useCallback((entry: HistoryItem) => {
    analytics.historyEntryClick(entry.queryText)
    dispatch({ type: 'LOAD_HISTORY_ENTRY', payload: entry })
  }, [])

  const handleSliderInteraction = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect()
      const isMobile = window.innerWidth <= 768

      if (isMobile) {
        // Horizontal slider for mobile
        const x = event.clientX - rect.left
        const percentage = (x / rect.width) * 100

        if (percentage <= 35) {
          dispatch({ type: 'SET_CONCISENESS', payload: 'short' })
        } else if (percentage <= 65) {
          dispatch({ type: 'SET_CONCISENESS', payload: 'medium' })
        } else {
          dispatch({ type: 'SET_CONCISENESS', payload: 'long' })
        }
      } else {
        // Vertical slider for desktop
        const y = event.clientY - rect.top
        const percentage = (y / rect.height) * 100

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
      if (state.isDragging) {
        handleSliderInteraction(event)
      }
    },
    [state.isDragging, handleSliderInteraction]
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
      if (!state.inputText.trim()) return
      handleOpenAI(state.inputText, false, false)
      dispatch({ type: 'SET_INPUT', payload: '' })
    },
    [state.inputText, handleOpenAI]
  )

  // Memoize handleRevert
  const handleRevert = useCallback(
    async (entry: HistoryItem, entryIndex: number) => {
      analytics.revertToHistory(entry.queryText, entryIndex)

      // Truncate conversation history to this point
      const truncatedHistory = state.conversationHistory.slice(
        0,
        entry.conversationHistoryIndex
      )
      dispatch({ type: 'SET_CONVERSATION_HISTORY', payload: truncatedHistory })

      // Remove all history entries after this one
      dispatch({
        type: 'SET_HISTORY_ENTRIES',
        payload: state.historyEntries.slice(entryIndex + 1),
      })

      // Re-run the query with truncated history
      await handleOpenAI(entry.queryText, true, false)
    },
    [state.conversationHistory, state.historyEntries, handleOpenAI]
  )

  // Memoize handleShuffle
  const handleShuffle = useCallback(async () => {
    analytics.shuffleQuestions()
    dispatch({ type: 'SET_LOADING', payload: true })

    try {
      const response = await fetch(API_ENDPOINTS.shuffleQuestions, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation_history: state.conversationHistory,
          current_topic: state.currentQuery,
        }),
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const data = await response.json()
      dispatch({ type: 'SET_OPTIONS', payload: data.options || [] })
    } catch (error) {
      console.error('Error shuffling questions:', error)
      analytics.apiError(
        '/api/shuffle-questions',
        error instanceof Error ? error.message : 'Unknown error'
      )
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [state.conversationHistory, state.currentQuery])

  // Modal handlers
  const handleCloseModal = useCallback(() => {
    analytics.modalClose('overlay')
    localStorage.setItem('hasVisitedShallowResearch', 'true')
    dispatch({ type: 'SET_MODAL_VISIBLE', payload: false })
  }, [])

  const handleCloseModalButton = useCallback(() => {
    analytics.modalClose('button')
    localStorage.setItem('hasVisitedShallowResearch', 'true')
    dispatch({ type: 'SET_MODAL_VISIBLE', payload: false })
  }, [])

  const handleGetStarted = useCallback(() => {
    analytics.modalClose('get_started')
    localStorage.setItem('hasVisitedShallowResearch', 'true')
    dispatch({ type: 'SET_MODAL_VISIBLE', payload: false })
  }, [])

  return (
    <ThemeProvider theme={state.isDarkMode ? darkTheme : lightTheme}>
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
                    payload: !state.isSidebarVisible,
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
              $isActive={state.conciseness === 'short'}
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
              $isActive={state.conciseness === 'long'}
              onClick={() =>
                dispatch({ type: 'SET_CONCISENESS', payload: 'long' })
              }
            >
              Long
            </SliderLabel>
          </div>
        </ConcisenessSidebar>

        <MobileOverlay
          $isVisible={state.isSidebarVisible}
          onClick={() =>
            dispatch({ type: 'SET_SIDEBAR_VISIBLE', payload: false })
          }
        />

        <Sidebar $isVisible={state.isSidebarVisible}>
          {/* History entries */}
          {state.historyEntries.map((entry, index) => (
            <HistoryEntry key={index}>
              <HistoryQuery onClick={() => loadHistoryEntry(entry)}>
                {entry.queryText}
              </HistoryQuery>
              <RevertButton onClick={() => handleRevert(entry, index)}>
                Revert
              </RevertButton>
            </HistoryEntry>
          ))}
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
                value={state.inputText}
                onChange={handleInputChange}
                disabled={state.isLoading}
              />
              <button type="submit" style={{ display: 'none' }} />
            </form>
          </InputContainer>

          {/* Suggested Questions - only show when no query/result and not loading */}
          {state.showSuggestedQuestions &&
            !state.currentQuery &&
            !state.result &&
            !state.isLoading && (
              <ButtonContainer>
                {state.suggestedQuestions.map((question, index) => (
                  <FollowUpButton
                    key={index}
                    onClick={() =>
                      handleSuggestedQuestionClick(question, index)
                    }
                    style={{ '--index': index } as React.CSSProperties}
                  >
                    {question}
                  </FollowUpButton>
                ))}
              </ButtonContainer>
            )}

          {state.currentQuery && (state.result || state.isLoading) && (
            <CurrentQuery>{state.currentQuery}</CurrentQuery>
          )}

          {(state.result || state.isLoading) && (
            <Result>
              {state.isLoading && !state.result ? (
                <LoadingIndicator>
                  Thinking
                  <span></span>
                  <span></span>
                  <span></span>
                </LoadingIndicator>
              ) : (
                <>
                  {renderResultWithHighlights(
                    state.result,
                    state.explorableConcepts
                  )}
                  {state.isLoading && state.result && <StreamingIndicator />}
                </>
              )}
            </Result>
          )}

          {state.options.length > 0 && !state.isLoading && (
            <>
              <ButtonContainer>
                {state.options.map((option, index) => (
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
                <ShuffleButton
                  onClick={handleShuffle}
                  disabled={state.isLoading}
                >
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
            const newTheme = state.isDarkMode ? 'light' : 'dark'
            analytics.themeToggle(newTheme)
            dispatch({ type: 'TOGGLE_THEME' })
          }}
        >
          <ThemeIcon $isVisible={state.isDarkMode}>
            <FontAwesomeIcon icon={faMoon} />
          </ThemeIcon>
          <ThemeIcon $isVisible={!state.isDarkMode}>
            <FontAwesomeIcon icon={faSun} />
          </ThemeIcon>
        </ThemeToggle>

        <ModalOverlay
          $isVisible={state.isModalVisible}
          onClick={handleCloseModal}
        >
          <ModalContainer
            $isVisible={state.isModalVisible}
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
