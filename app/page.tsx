'use client'

import React, {
  useState,
  useReducer,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faShuffle } from '@fortawesome/free-solid-svg-icons'
import { API_ENDPOINTS } from './config'

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
  HistorySnippet,
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
} from './StyledComponents'

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

// Reducer function
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_INPUT':
      return { ...state, inputText: action.payload }
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
        isSidebarVisible: true,
      }
    case 'SET_HISTORY_ENTRIES':
      return { ...state, historyEntries: action.payload }
    case 'SET_CURRENT_QUERY':
      return { ...state, currentQuery: action.payload }
    case 'SET_CONCISENESS':
      return { ...state, conciseness: action.payload }
    case 'SET_DRAGGING':
      return { ...state, isDragging: action.payload }
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
}

export default function Home() {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Add refs for abort controllers
  const abortControllerRef = useRef<AbortController | null>(null)
  const shuffleAbortControllerRef = useRef<AbortController | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cancel any ongoing requests when component unmounts
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (shuffleAbortControllerRef.current) {
        shuffleAbortControllerRef.current.abort()
      }
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
      dispatch({ type: 'SET_CONCISENESS', payload: value })
    },
    []
  )

  // Memoized getSnippet function
  const getSnippet = useCallback((text: string) => {
    const firstSentence = text.match(/^[^.!?]+[.!?]/)
    return firstSentence ? firstSentence[0] : text.substring(0, 100) + '...'
  }, [])

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
    async (
      reader: ReadableStreamDefaultReader<Uint8Array>,
      signal: AbortSignal
    ) => {
      const decoder = new TextDecoder()
      let buffer = ''
      let finalResponse: any = null
      let streamedResult = ''

      try {
        while (true) {
          // Check if aborted
          if (signal.aborted) {
            break
          }

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
                    // Only update state if not aborted
                    if (!signal.aborted) {
                      dispatch({ type: 'SET_RESULT', payload: streamedResult })
                    }
                    break

                  case 'complete':
                    finalResponse = data.data
                    if (!signal.aborted) {
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
                    }
                    break

                  case 'error':
                    if (!signal.aborted) {
                      console.error('Stream error:', data.message)
                      dispatch({
                        type: 'SET_RESULT',
                        payload: 'Error: ' + data.message,
                      })
                    }
                    break

                  case 'end':
                    break
                }
              } catch (parseError) {
                if (!signal.aborted) {
                  console.warn('Failed to parse SSE data:', dataContent)
                }
              }
            }
          }
        }
      } catch (error) {
        // Only log errors if not due to abort
        if (
          !signal.aborted &&
          error instanceof Error &&
          error.name !== 'AbortError'
        ) {
          console.error('Stream processing error:', error)
        }
      } finally {
        try {
          reader.releaseLock()
        } catch (e) {
          // Ignore errors when releasing lock (stream might already be closed)
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
      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // Create new abort controller for this request
      const abortController = new AbortController()
      abortControllerRef.current = abortController

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
          signal: abortController.signal,
        })

        if (!response.ok) {
          throw new Error('Network response was not ok')
        }

        const reader = response.body?.getReader()
        if (!reader) {
          throw new Error('No response body')
        }

        const { finalResponse, streamedResult } = await processStreamResponse(
          reader,
          abortController.signal
        )

        // Update conversation history only if not aborted
        if (!abortController.signal.aborted) {
          const finalResultText = finalResponse?.answer || streamedResult
          if (finalResultText) {
            dispatch({
              type: 'ADD_CONVERSATION_HISTORY',
              payload: [
                { role: 'user', content: message },
                { role: 'assistant', content: finalResultText },
              ],
            })
          }
        }
      } catch (error) {
        // Handle abort errors silently
        if (error instanceof Error) {
          if (error.name === 'AbortError' || abortController.signal.aborted) {
            // Request was aborted, no need to show error
            console.log('Request aborted')
          } else {
            console.error('Error:', error)
            dispatch({
              type: 'SET_RESULT',
              payload: 'Error: Something went wrong',
            })
            dispatch({ type: 'SET_OPTIONS', payload: [] })
          }
        }
      } finally {
        // Only clear loading state if this request wasn't aborted
        if (
          abortControllerRef.current === abortController &&
          !abortController.signal.aborted
        ) {
          dispatch({ type: 'SET_LOADING', payload: false })
        }
      }
    },
    [state, processStreamResponse]
  )

  // Memoize event handlers that depend on handleOpenAI
  const handleFollowUpClick = useCallback(
    (question: string) => {
      handleOpenAI(question, true, true)
    },
    [handleOpenAI]
  )

  const handleArticleItemClick = useCallback(
    (concept: string) => {
      handleOpenAI(concept, true, true)
    },
    [handleOpenAI]
  )

  // Optimized renderResultWithHighlights using memoization
  const renderResultWithHighlights = useCallback(
    (text: string, highlights: string[]) => {
      if (highlights.length === 0) return text

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
    dispatch({ type: 'LOAD_HISTORY_ENTRY', payload: entry })
  }, [])

  const handleSliderInteraction = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect()
      const y = event.clientY - rect.top
      const percentage = (y / rect.height) * 100

      // Snap to closest position
      if (percentage <= 35) {
        dispatch({ type: 'SET_CONCISENESS', payload: 'short' })
      } else if (percentage <= 65) {
        dispatch({ type: 'SET_CONCISENESS', payload: 'medium' })
      } else {
        dispatch({ type: 'SET_CONCISENESS', payload: 'long' })
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
    // Cancel any existing shuffle request
    if (shuffleAbortControllerRef.current) {
      shuffleAbortControllerRef.current.abort()
    }

    const abortController = new AbortController()
    shuffleAbortControllerRef.current = abortController

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
        signal: abortController.signal,
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const data = await response.json()
      if (!abortController.signal.aborted) {
        dispatch({ type: 'SET_OPTIONS', payload: data.options || [] })
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error shuffling questions:', error)
      }
    } finally {
      if (
        shuffleAbortControllerRef.current === abortController &&
        !abortController.signal.aborted
      ) {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }
  }, [state.conversationHistory, state.currentQuery])

  return (
    <AppContainer>
      <NavigationHeader>
        <NavigationContainer>
          <Logo>Rabbit Trail</Logo>
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

      <Sidebar $isVisible={state.isSidebarVisible}>
        {/* History entries */}
        {state.historyEntries.map((entry, index) => (
          <HistoryEntry key={index}>
            <HistoryQuery onClick={() => loadHistoryEntry(entry)}>
              {entry.queryText}
            </HistoryQuery>
            <HistorySnippet>{getSnippet(entry.responseText)}</HistorySnippet>
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

        {state.currentQuery && (state.result || state.isLoading) && (
          <CurrentQuery>{state.currentQuery}</CurrentQuery>
        )}

        {(state.result || state.isLoading) && (
          <Result>
            {state.isLoading && !state.result
              ? 'Thinking...'
              : renderResultWithHighlights(
                  state.result,
                  state.explorableConcepts
                )}
            {state.isLoading && state.result && (
              <span style={{ opacity: 0.5 }}>▊</span>
            )}
          </Result>
        )}

        {state.options.length > 0 && !state.isLoading && (
          <>
            <ButtonContainer>
              {state.options.map((option, index) => (
                <FollowUpButton
                  key={index}
                  onClick={() => handleFollowUpClick(option)}
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
              <ShuffleButton onClick={handleShuffle} disabled={state.isLoading}>
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
    </AppContainer>
  )
}
