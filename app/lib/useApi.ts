import { useCallback } from 'react'
import { API_ENDPOINTS } from '../config'
import { useAppAnalytics } from './analytics-hooks'
import type { AppState, AppAction, HistoryItem } from '../state'

// The state and dispatch types are essential for the hook to interact
// with the component's state. We'll ensure these are exported from state.ts later.

const processStreamResponse = async (
  reader: ReadableStreamDefaultReader<Uint8Array>,
  dispatch: React.Dispatch<AppAction>
) => {
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

      const lines = buffer.split('\n\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataContent = line.slice(6).trim()

          if (!dataContent || dataContent === '[DONE]') {
            continue
          }

          try {
            const { type, content, data } = JSON.parse(dataContent)

            switch (type) {
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
                if (Math.abs(streamedResult.length - answer.length) > 10) {
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
                break

              case 'error':
                const { message } = JSON.parse(dataContent)
                console.error('Stream error:', message)
                dispatch({
                  type: 'SET_RESULT',
                  payload: 'Error: ' + message,
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
    if (error instanceof Error && error.name !== 'AbortError') {
      console.debug('Stream read error:', error.message)
    }
  } finally {
    try {
      reader.releaseLock()
    } catch (e) {
      // Ignore
    }
  }

  return { finalResponse, streamedResult }
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

      try {
        const response = await fetch(API_ENDPOINTS.openai, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: message,
            conversation_history: includeHistory ? conversationHistory : [],
            conciseness,
          }),
        })

        if (!response.ok) {
          throw new Error('Network response was not ok')
        }

        const reader = response.body?.getReader()
        if (!reader) {
          throw new Error('No response body')
        }

        dispatch({ type: 'SET_STREAMING', payload: true })
        const { finalResponse, streamedResult } = await processStreamResponse(
          reader,
          dispatch
        )
        dispatch({ type: 'SET_STREAMING', payload: false })

        // Ensure typewriter is marked as done when streaming completes
        dispatch({ type: 'SET_TYPEWRITER_DONE', payload: true })

        const finalResultText = finalResponse?.answer || streamedResult
        if (finalResultText) {
          dispatch({
            type: 'ADD_CONVERSATION_HISTORY',
            payload: [
              { role: 'user', content: message },
              { role: 'assistant', content: finalResultText },
            ],
          })
          trackSearchComplete(message.length, startTime)
        }
      } catch (error) {
        console.error('Error:', error)
        trackSearchError(
          '/api/openai',
          error instanceof Error ? error.message : 'Unknown error'
        )
        dispatch({ type: 'SET_RESULT', payload: 'Error: Something went wrong' })
        dispatch({ type: 'SET_OPTIONS', payload: [] })
        dispatch({ type: 'RESET_STREAMING' })
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
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

  return { handleOpenAI, handleShuffle }
}
