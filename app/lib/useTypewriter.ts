import { useCallback, useEffect } from 'react'
import { AppAction } from '../state'

type UseTypewriterParams = {
  isStreaming: boolean
  streamBuffer: string
  displayedText: string
  dispatch: React.Dispatch<AppAction>
}

// Calculate realistic typing delay based on character and context
const getTypingDelay = (
  char: string,
  previousChar: string = '',
  index: number = 0
) => {
  const baseDelay = 3 // Very fast base speed

  // Longer pauses after sentence-ending punctuation
  if (previousChar === '.' || previousChar === '!' || previousChar === '?') {
    return baseDelay + Math.random() * 8 + 12 // 15-23ms pause after sentences
  }

  // Medium pause after commas, semicolons, colons
  if (previousChar === ',' || previousChar === ';' || previousChar === ':') {
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
}

export const useTypewriter = ({
  isStreaming,
  streamBuffer,
  displayedText,
  dispatch,
}: UseTypewriterParams) => {
  const memoizedGetTypingDelay = useCallback(getTypingDelay, [])

  // Typewriter animation effect
  useEffect(() => {
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
      }, memoizedGetTypingDelay(nextChar, previousChar, currentLength))

      return () => clearTimeout(timer)
    } else if (currentLength === targetText.length && isStreaming) {
      // When typewriter catches up and we're still streaming, sync the result
      dispatch({ type: 'SET_RESULT', payload: displayedText })
    }
  }, [
    isStreaming,
    streamBuffer,
    displayedText,
    dispatch,
    memoizedGetTypingDelay,
  ])

  // Handle smooth transition when streaming stops
  useEffect(() => {
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
          dispatch({ type: 'SET_TYPEWRITER_DONE', payload: true })
        }
      }, memoizedGetTypingDelay(nextChar, previousChar, displayedText.length))

      return () => clearTimeout(timer)
    } else if (
      !isStreaming &&
      streamBuffer &&
      displayedText.length === streamBuffer.length
    ) {
      // Streaming stopped and typewriter is already caught up
      dispatch({ type: 'SET_RESULT', payload: displayedText })
      dispatch({ type: 'SET_TYPEWRITER_DONE', payload: true })
    }
  }, [
    isStreaming,
    streamBuffer,
    displayedText,
    dispatch,
    memoizedGetTypingDelay,
  ])
}
