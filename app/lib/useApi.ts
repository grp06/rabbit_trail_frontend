import { useCallback } from 'react'
import { API_ENDPOINTS } from '../config'
import { useAppAnalytics } from './analytics-hooks'
import type { AppState, AppAction, HistoryItem } from '../state'

// Configuration for streaming robustness
const STREAM_CONFIG = {
  TIMEOUT_MS: 30000, // 30 seconds timeout
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000, // 1 second between retries
  CHUNK_TIMEOUT_MS: 10000, // 10 seconds max between chunks
}

// Enhanced error types for better handling
enum StreamErrorType {
  NETWORK_ERROR = 'network_error',
  TIMEOUT_ERROR = 'timeout_error',
  PARSE_ERROR = 'parse_error',
  CONNECTION_CLOSED = 'connection_closed',
  SERVER_ERROR = 'server_error',
}

interface StreamError extends Error {
  type: StreamErrorType
  retryable: boolean
}

const createStreamError = (
  message: string,
  type: StreamErrorType,
  retryable: boolean = false
): StreamError => {
  const error = new Error(message) as StreamError
  error.type = type
  error.retryable = retryable
  return error
}

const processStreamResponse = async (
  reader: ReadableStreamDefaultReader<Uint8Array>,
  dispatch: React.Dispatch<AppAction>,
  abortSignal: AbortSignal
) => {
  const decoder = new TextDecoder()
  let buffer = ''
  let finalResponse: any = null
  let streamedResult = ''
  let lastChunkTime = Date.now()

  try {
    while (true) {
      // Check for abort signal
      if (abortSignal.aborted) {
        throw createStreamError(
          'Stream aborted',
          StreamErrorType.CONNECTION_CLOSED,
          false
        )
      }

      // Check for chunk timeout
      if (Date.now() - lastChunkTime > STREAM_CONFIG.CHUNK_TIMEOUT_MS) {
        throw createStreamError(
          'Chunk timeout - no data received',
          StreamErrorType.TIMEOUT_ERROR,
          true
        )
      }

      const { done, value } = await reader.read()
      if (done) break

      lastChunkTime = Date.now()
      const chunk = decoder.decode(value, { stream: true })
      buffer += chunk

      const lines = buffer.split('\n\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataContent = line.slice(6).trim()

          if (!dataContent || dataContent === '[DONE]') {
            continue
          }

          try {
            const { type, content, data, message } = JSON.parse(dataContent)

            switch (type) {
              case 'connected':
                // Server confirmed connection - log but don't update UI
                console.debug('Stream connection established')
                break

              case 'heartbeat':
                // Server heartbeat - log but don't update UI
                console.debug('Stream heartbeat received')
                break

              case 'text_delta':
                streamedResult += content
                dispatch({
                  type: 'UPDATE_STREAM_BUFFER',
                  payload: streamedResult,
                })
                break

              case 'complete':
                finalResponse = data
                const {
                  answer,
                  options: dataOptions,
                  explorable_concepts,
                } = data

                // Debug logging
                console.debug('Stream complete event received:', {
                  hasAnswer: !!answer,
                  answerLength: answer?.length || 0,
                  optionsCount: dataOptions?.length || 0,
                  explorableConceptsCount: explorable_concepts?.length || 0,
                })

                // Always update stream buffer with the final answer to ensure consistency
                if (answer && answer.length > 0) {
                  streamedResult = answer
                  dispatch({
                    type: 'UPDATE_STREAM_BUFFER',
                    payload: answer,
                  })
                }
                dispatch({
                  type: 'SET_OPTIONS',
                  payload: dataOptions || [],
                })
                dispatch({
                  type: 'SET_EXPLORABLE_CONCEPTS',
                  payload: explorable_concepts || [],
                })

                console.debug('Options dispatched:', dataOptions || [])
                break

              case 'error':
                console.error('Stream error:', message || 'Unknown error')
                throw createStreamError(
                  message || 'Server reported an error',
                  StreamErrorType.SERVER_ERROR,
                  false
                )

              case 'refusal':
                console.warn('Request was refused:', message)
                throw createStreamError(
                  `Request refused: ${message || 'Content policy violation'}`,
                  StreamErrorType.SERVER_ERROR,
                  false
                )

              case 'end':
                console.debug('Stream ended')
                break

              default:
                console.debug('Unknown stream event type:', type)
                break
            }
          } catch (parseError) {
            if (
              parseError instanceof Error &&
              (parseError as StreamError).type
            ) {
              // Re-throw stream errors
              throw parseError
            }
            console.warn('Failed to parse SSE data:', dataContent)
            // Don't throw for parse errors, just log and continue
          }
        }
      }
    }
  } catch (error) {
    // Handle different error types
    if (error instanceof Error) {
      const streamError = error as StreamError

      // Don't log AbortError as these are intentional
      if (
        error.name !== 'AbortError' &&
        streamError.type !== StreamErrorType.CONNECTION_CLOSED
      ) {
        console.error(
          'Stream read error:',
          error.message,
          'Type:',
          streamError.type
        )
      }

      // Re-throw to be handled by caller
      throw error
    }
  } finally {
    try {
      reader.releaseLock()
    } catch (e) {
      // Ignore lock release errors
    }
  }

  return { finalResponse, streamedResult }
}

// Enhanced fetch with timeout and retry logic
const fetchWithRetry = async (
  url: string,
  options: RequestInit,
  retryAttempt: number = 0
): Promise<Response> => {
  const controller = new AbortController()

  // Set up timeout
  const timeoutId = setTimeout(() => {
    controller.abort()
  }, STREAM_CONFIG.TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw createStreamError(
        `HTTP ${response.status}: ${response.statusText}`,
        StreamErrorType.SERVER_ERROR,
        response.status >= 500 // Server errors are retryable
      )
    }

    return response
  } catch (error) {
    clearTimeout(timeoutId)

    if (error instanceof Error) {
      // Handle specific error types
      if (error.name === 'AbortError') {
        throw createStreamError(
          'Request timeout',
          StreamErrorType.TIMEOUT_ERROR,
          true
        )
      }

      if (
        error.message.includes('network') ||
        error.message.includes('fetch')
      ) {
        throw createStreamError(
          error.message,
          StreamErrorType.NETWORK_ERROR,
          true
        )
      }

      // If it's already a stream error, re-throw
      if ((error as StreamError).type) {
        throw error
      }

      // Generic network error
      throw createStreamError(
        error.message,
        StreamErrorType.NETWORK_ERROR,
        true
      )
    }

    throw error
  }
}

export function useApi(state: AppState, dispatch: React.Dispatch<AppAction>) {
  const {
    result,
    currentQuery,
    options,
    explorableConcepts,
    conversationHistory,
    conciseness,
  } = state

  const { search: searchAnalytics, ui: uiAnalytics } = useAppAnalytics()
  const { trackSearchStart, trackSearchComplete, trackSearchError } =
    searchAnalytics
  const { trackShuffle } = uiAnalytics

  const handleOpenAI = useCallback(
    async (
      message: string,
      includeHistory: boolean,
      isFollowUp: boolean = false
    ) => {
      dispatch({ type: 'HIDE_SUGGESTED_QUESTIONS' })
      const startTime = trackSearchStart(message, conciseness)

      if (isFollowUp && result && currentQuery) {
        const newHistoryEntry: HistoryItem = {
          queryText: currentQuery,
          responseText: result,
          suggestedFollowups: options,
          explorableConcepts,
          conversationHistoryIndex: conversationHistory.length,
        }
        dispatch({ type: 'ADD_HISTORY_ENTRY', payload: newHistoryEntry })
      }

      dispatch({ type: 'SET_CURRENT_QUERY', payload: message })
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'RESET_QUERY_STATE' })
      dispatch({ type: 'RESET_STREAMING' })

      let lastError: StreamError | null = null

      for (let attempt = 0; attempt < STREAM_CONFIG.RETRY_ATTEMPTS; attempt++) {
        try {
          // Add delay between retries (except first attempt)
          if (attempt > 0) {
            await new Promise((resolve) =>
              setTimeout(resolve, STREAM_CONFIG.RETRY_DELAY_MS * attempt)
            )
            console.log(
              `Retrying request (attempt ${attempt + 1}/${
                STREAM_CONFIG.RETRY_ATTEMPTS
              })`
            )
          }

          const response = await fetchWithRetry(
            API_ENDPOINTS.openai,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                message: message,
                conversation_history: includeHistory ? conversationHistory : [],
                conciseness,
              }),
            },
            attempt
          )

          const reader = response.body?.getReader()
          if (!reader) {
            throw createStreamError(
              'No response body',
              StreamErrorType.SERVER_ERROR,
              false
            )
          }

          // Create abort controller for this specific stream
          const streamController = new AbortController()

          dispatch({ type: 'SET_STREAMING', payload: true })
          const { finalResponse, streamedResult } = await processStreamResponse(
            reader,
            dispatch,
            streamController.signal
          )
          dispatch({ type: 'SET_STREAMING', payload: false })

          const finalResultText = finalResponse?.answer || streamedResult
          if (finalResultText) {
            // Set the final result in state so the UI displays it correctly
            dispatch({ type: 'SET_RESULT', payload: finalResultText })

            dispatch({
              type: 'ADD_CONVERSATION_HISTORY',
              payload: [
                { role: 'user', content: message },
                { role: 'assistant', content: finalResultText },
              ],
            })
            trackSearchComplete(message.length, startTime)
          }

          // Success! Break out of retry loop
          return
        } catch (error) {
          lastError = error as StreamError

          // Log the error
          console.error(
            `Request attempt ${attempt + 1} failed:`,
            lastError.message
          )

          // If this error is not retryable, break immediately
          if (
            !lastError.retryable ||
            attempt === STREAM_CONFIG.RETRY_ATTEMPTS - 1
          ) {
            break
          }
        }
      }

      // All retries failed
      console.error(
        'All retry attempts failed. Last error:',
        lastError?.message
      )

      let errorMessage = 'Something went wrong'
      if (lastError) {
        switch (lastError.type) {
          case StreamErrorType.TIMEOUT_ERROR:
            errorMessage = 'Request timed out. Please try again.'
            break
          case StreamErrorType.NETWORK_ERROR:
            errorMessage =
              'Network error. Please check your connection and try again.'
            break
          case StreamErrorType.CONNECTION_CLOSED:
            errorMessage = 'Connection was interrupted. Please try again.'
            break
          case StreamErrorType.SERVER_ERROR:
            errorMessage = 'Server error. Please try again in a moment.'
            break
          default:
            errorMessage = lastError.message || 'An unexpected error occurred'
        }
      }

      trackSearchError('/api/openai', lastError?.message || 'Unknown error')
      dispatch({ type: 'SET_RESULT', payload: `Error: ${errorMessage}` })
      dispatch({ type: 'SET_OPTIONS', payload: [] })
      dispatch({ type: 'RESET_STREAMING' })
      dispatch({ type: 'SET_LOADING', payload: false })
    },
    [
      result,
      currentQuery,
      options,
      explorableConcepts,
      conversationHistory,
      conciseness,
      trackSearchStart,
      trackSearchComplete,
      trackSearchError,
      dispatch,
    ]
  )

  const handleShuffle = useCallback(async () => {
    trackShuffle()
    dispatch({ type: 'SET_LOADING', payload: true })

    try {
      const response = await fetch(API_ENDPOINTS.shuffleQuestions, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_history: conversationHistory,
          current_topic: currentQuery,
        }),
      })

      if (!response.ok) throw new Error('Network response was not ok')
      const { options: shuffledOptions } = await response.json()
      dispatch({ type: 'SET_OPTIONS', payload: shuffledOptions || [] })
    } catch (error) {
      console.error('Error shuffling questions:', error)
      trackSearchError(
        '/api/shuffle-questions',
        error instanceof Error ? error.message : 'Unknown error'
      )
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [
    conversationHistory,
    currentQuery,
    trackShuffle,
    trackSearchError,
    dispatch,
  ])

  const handleGenerateQuiz = useCallback(async () => {
    dispatch({ type: 'SET_GENERATING_QUIZ', payload: true })
    dispatch({ type: 'SET_QUIZ_MODAL_VISIBLE', payload: true })
    dispatch({ type: 'RESET_QUIZ' })

    try {
      const response = await fetch(API_ENDPOINTS.generateQuiz, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_history: conversationHistory,
        }),
      })

      if (!response.ok) throw new Error('Network response was not ok')
      const { questions } = await response.json()

      if (questions && questions.length > 0) {
        dispatch({ type: 'SET_QUIZ_QUESTIONS', payload: questions })
      } else {
        console.error('No quiz questions received')
        dispatch({ type: 'SET_QUIZ_MODAL_VISIBLE', payload: false })
      }
    } catch (error) {
      console.error('Error generating quiz:', error)
      trackSearchError(
        '/api/generate-quiz',
        error instanceof Error ? error.message : 'Unknown error'
      )
      dispatch({ type: 'SET_QUIZ_MODAL_VISIBLE', payload: false })
    } finally {
      dispatch({ type: 'SET_GENERATING_QUIZ', payload: false })
    }
  }, [conversationHistory, trackSearchError, dispatch])

  return { handleOpenAI, handleShuffle, handleGenerateQuiz }
}
