'use client'

import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faShuffle,
} from '@fortawesome/free-solid-svg-icons'

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
  ExpandButton,
  ExpandedContent,
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
  isExpanded: boolean
}

export default function Home() {
  const [inputText, setInputText] = useState('')
  const [result, setResult] = useState('')
  const [options, setOptions] = useState<string[]>([])
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ role: string; content: string }>
  >([])
  const [explorableConcepts, setExplorableConcepts] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSidebarVisible, setIsSidebarVisible] = useState(false)
  const [historyEntries, setHistoryEntries] = useState<HistoryItem[]>([])
  const [currentQuery, setCurrentQuery] = useState('')
  const [conciseness, setConciseness] = useState<'short' | 'medium' | 'long'>(
    'short'
  )
  const [isDragging, setIsDragging] = useState(false)

  // Rest of the existing component logic
  const handleOpenAI = async (
    message: string,
    includeHistory: boolean,
    isFollowUp: boolean = false
  ) => {
    // If this is a follow-up and we have a current result, save it to history
    if (isFollowUp && result && currentQuery) {
      const newHistoryEntry: HistoryItem = {
        queryText: currentQuery,
        responseText: result,
        suggestedFollowups: options,
        explorableConcepts: explorableConcepts,
        isExpanded: false,
      }
      setHistoryEntries([newHistoryEntry, ...historyEntries])
      setIsSidebarVisible(true)
    }

    setCurrentQuery(message)
    setIsLoading(true)
    setResult('')
    setOptions([])
    setExplorableConcepts([])

    try {
      const response = await fetch('http://127.0.0.1:8000/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          conversation_history: includeHistory ? conversationHistory : [],
          conciseness: conciseness,
        }),
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

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
                    // Update result with streaming text
                    streamedResult += data.content
                    setResult(streamedResult)
                    break

                  case 'complete':
                    // Set final structured response but preserve streamed text
                    finalResponse = data.data
                    // Only update result if it's significantly different (like if streaming failed)
                    if (
                      Math.abs(
                        streamedResult.length - data.data.answer.length
                      ) > 10
                    ) {
                      setResult(data.data.answer)
                    }
                    setOptions(data.data.options || [])
                    setExplorableConcepts(data.data.explorable_concepts || [])
                    break

                  case 'error':
                    console.error('Stream error:', data.message)
                    setResult('Error: ' + data.message)
                    break

                  case 'end':
                    // Stream completed
                    break
                }
              } catch (parseError) {
                console.warn('Failed to parse SSE data:', dataContent)
              }
            }
          }
        }
      } finally {
        reader.releaseLock()
      }

      // Update conversation history
      const finalResultText = finalResponse?.answer || streamedResult
      if (finalResultText) {
        setConversationHistory((prev) => [
          ...prev,
          { role: 'user', content: message },
          { role: 'assistant', content: finalResultText },
        ])
      }
    } catch (error) {
      console.error('Error:', error)
      setResult('Error: Something went wrong')
      setOptions([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!inputText.trim()) return
    handleOpenAI(inputText, false, false)
    setInputText('')
  }

  const handleFollowUpClick = (question: string) => {
    handleOpenAI(question, true, true)
  }

  const handleShuffle = async () => {
    setIsLoading(true)

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/api/shuffle-questions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            conversation_history: conversationHistory,
            current_topic: currentQuery,
          }),
        }
      )

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const data = await response.json()
      setOptions(data.options || [])
    } catch (error) {
      console.error('Error shuffling questions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleArticleItemClick = (concept: string) => {
    handleOpenAI(concept, true, true)
  }

  const renderResultWithHighlights = (text: string, highlights: string[]) => {
    if (highlights.length === 0) return text

    const parts = text.split(new RegExp(`(${highlights.join('|')})`, 'gi'))
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
  }

  const toggleHistoryExpand = (index: number) => {
    setHistoryEntries((prev) =>
      prev.map((entry, i) =>
        i === index ? { ...entry, isExpanded: !entry.isExpanded } : entry
      )
    )
  }

  const loadHistoryEntry = (entry: HistoryItem) => {
    setCurrentQuery(entry.queryText)
    setResult(entry.responseText)
    setOptions(entry.suggestedFollowups)
    setExplorableConcepts(entry.explorableConcepts)
  }

  const getSnippet = (text: string) => {
    const firstSentence = text.match(/^[^.!?]+[.!?]/)
    return firstSentence ? firstSentence[0] : text.substring(0, 100) + '...'
  }

  const handleSliderInteraction = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const y = event.clientY - rect.top
    const percentage = (y / rect.height) * 100

    // Snap to closest position
    if (percentage <= 35) {
      setConciseness('short')
    } else if (percentage <= 65) {
      setConciseness('medium')
    } else {
      setConciseness('long')
    }
  }

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true)
    handleSliderInteraction(event)
  }

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      handleSliderInteraction(event)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  const getSliderPosition = () => {
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
  }

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
            $isActive={conciseness === 'short'}
            onClick={() => setConciseness('short')}
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
            <SliderThumb $position={getSliderPosition()} />
          </SliderContainer>
          <SliderLabel
            $isActive={conciseness === 'long'}
            onClick={() => setConciseness('long')}
          >
            Long
          </SliderLabel>
        </div>
      </ConcisenessSidebar>

      <Sidebar $isVisible={isSidebarVisible}>
        {/* History entries */}
        {historyEntries.map((entry, index) => (
          <HistoryEntry key={index}>
            <HistoryQuery onClick={() => loadHistoryEntry(entry)}>
              {entry.queryText}
            </HistoryQuery>
            <HistorySnippet>{getSnippet(entry.responseText)}</HistorySnippet>
            <ExpandButton onClick={() => toggleHistoryExpand(index)}>
              {entry.isExpanded ? 'Collapse' : 'Expand'}
            </ExpandButton>
            {entry.isExpanded && (
              <ExpandedContent>{entry.responseText}</ExpandedContent>
            )}
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
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading}
            />
            <button type="submit" style={{ display: 'none' }} />
          </form>
        </InputContainer>

        {currentQuery && (result || isLoading) && (
          <CurrentQuery>{currentQuery}</CurrentQuery>
        )}

        {(result || isLoading) && (
          <Result>
            {isLoading && !result
              ? 'Thinking...'
              : renderResultWithHighlights(result, explorableConcepts)}
            {isLoading && result && <span style={{ opacity: 0.5 }}>▊</span>}
          </Result>
        )}

        {options.length > 0 && !isLoading && (
          <>
            <ButtonContainer>
              {options.map((option, index) => (
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
    </AppContainer>
  )
}
