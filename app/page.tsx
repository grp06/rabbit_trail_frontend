'use client'

import React, { useMemo, useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faShuffle,
  faMoon,
  faSun,
  faBars,
} from '@fortawesome/free-solid-svg-icons'
import { ThemeProvider, createGlobalStyle } from 'styled-components'
import {
  useAppContext,
  useSearchState,
  useHistoryState,
  useUIState,
  useQuestionsState,
} from './context/AppContext'
import { ConcisenessSlider } from './components/ConcisenessSlider'
import { useTypewriter } from './lib/useTypewriter'
import type { HistoryItem } from './state'

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
  ConcisenessSidebarCloseButton,
  CollapsedConcisenessTrigger,
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

// Separate components for better organization
const SearchInput: React.FC = () => {
  const { state, handleInputChange, handleOpenAI } = useAppContext()
  const { inputText, isLoading } = state

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (!inputText.trim()) return

      handleOpenAI(inputText, false, false)
      handleInputChange('')
    },
    [inputText, handleInputChange, handleOpenAI]
  )

  return (
    <InputContainer>
      <form onSubmit={handleSubmit} style={{ display: 'flex', width: '100%' }}>
        <CenteredInput
          type="text"
          placeholder="Ask a question..."
          value={inputText}
          onChange={(e) => handleInputChange(e.target.value)}
          disabled={isLoading}
        />
        <button type="submit" style={{ display: 'none' }} />
      </form>
    </InputContainer>
  )
}

const SuggestedQuestions: React.FC = () => {
  const { handleSuggestedQuestionClick } = useAppContext()
  const { suggestedQuestions, showSuggestedQuestions } = useQuestionsState()
  const { result, isLoading, currentQuery } = useSearchState()

  if (!showSuggestedQuestions || currentQuery || result || isLoading) {
    return null
  }

  return (
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
  )
}

const SearchResult: React.FC = () => {
  const { state, dispatch, handleArticleItemClick } = useAppContext()
  const {
    result,
    isLoading,
    currentQuery,
    isStreaming,
    displayedText,
    streamBuffer,
  } = useSearchState()
  const { explorableConcepts } = useQuestionsState()
  const { isTypewriterDone } = state

  // Typewriter animation hook
  useTypewriter({
    isStreaming,
    streamBuffer,
    displayedText,
    dispatch,
  })

  // Memoize the highlight regex to avoid recreating it on every render
  const highlightRegex = useMemo(() => {
    if (explorableConcepts.length === 0) return null
    return new RegExp(`(${explorableConcepts.join('|')})`, 'gi')
  }, [explorableConcepts])

  // Optimized renderResultWithHighlights using memoization
  const renderResultWithHighlights = useCallback(
    (text: string, highlights: string[]) => {
      if (!text) return null

      // If no highlights yet, wrap potential highlight words in spans to reserve space
      if (highlights.length === 0) {
        const words = text.split(/(\s+)/)
        return words.map((word, index) => {
          if (/^\s+$/.test(word)) {
            return word
          }
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

  if (!currentQuery || (!result && !isLoading && !isStreaming)) {
    return null
  }

  return (
    <>
      <CurrentQuery>{currentQuery}</CurrentQuery>
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
              (streamBuffer && displayedText.length < streamBuffer.length) ? (
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
    </>
  )
}

const FollowUpQuestions: React.FC = () => {
  const { handleFollowUpClick, handleShuffle } = useAppContext()
  const { options } = useQuestionsState()
  const { isLoading } = useSearchState()
  const { isTypewriterDone } = useAppContext().state

  if (options.length === 0 || isLoading || !isTypewriterDone) {
    return null
  }

  return (
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
        style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}
      >
        <ShuffleButton onClick={handleShuffle} disabled={isLoading}>
          <FontAwesomeIcon icon={faShuffle} style={{ marginRight: '8px' }} />
          Shuffle Questions
        </ShuffleButton>
      </div>
    </>
  )
}

const HistorySidebar: React.FC = () => {
  const { loadHistoryEntry, handleRevert, handleSidebarToggle } =
    useAppContext()
  const { historyEntries } = useHistoryState()
  const { isSidebarVisible } = useUIState()

  return (
    <>
      <MobileOverlay
        $isVisible={isSidebarVisible}
        onClick={handleSidebarToggle}
      />
      <Sidebar $isVisible={isSidebarVisible}>
        {historyEntries.length > 0 ? (
          historyEntries.map((entry, index) => (
            <HistoryEntry key={index}>
              <HistoryQuery onClick={() => loadHistoryEntry(entry)}>
                {entry.queryText}
              </HistoryQuery>
              <RevertButton onClick={() => handleRevert(entry, index)}>
                Revert
              </RevertButton>
            </HistoryEntry>
          ))
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
              Your research trail will appear here as you explore rabbit holes.
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
    </>
  )
}

const WelcomeModal: React.FC = () => {
  const { handleCloseModal } = useAppContext()
  const { isModalVisible } = useUIState()

  return (
    <ModalOverlay
      $isVisible={isModalVisible}
      onClick={() => handleCloseModal('overlay')}
    >
      <ModalContainer
        $isVisible={isModalVisible}
        onClick={(e) => e.stopPropagation()}
      >
        <ModalCloseButton onClick={() => handleCloseModal('button')}>
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
        <ModalButton onClick={() => handleCloseModal('get_started')}>
          Start Exploring
        </ModalButton>
      </ModalContainer>
    </ModalOverlay>
  )
}

export default function Home() {
  const { handleThemeToggle, handleConcisenesChange, handleSidebarToggle } =
    useAppContext()
  const { isDarkMode, conciseness } = useUIState()

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <GlobalStyle />
      <AppContainer>
        <NavigationHeader>
          <NavigationContainer>
            <Logo>Shallow Research</Logo>
            <NavigationLinks>
              <MobileMenuButton onClick={handleSidebarToggle}>
                <FontAwesomeIcon icon={faBars} />
              </MobileMenuButton>
            </NavigationLinks>
          </NavigationContainer>
        </NavigationHeader>

        <ConcisenessSlider
          conciseness={conciseness}
          onConcisenessChange={handleConcisenesChange}
        />

        <HistorySidebar />

        <MainContainer>
          <SearchInput />
          <SuggestedQuestions />
          <SearchResult />
          <FollowUpQuestions />
        </MainContainer>

        <ThemeToggle onClick={handleThemeToggle}>
          <ThemeIcon $isVisible={isDarkMode}>
            <FontAwesomeIcon icon={faMoon} />
          </ThemeIcon>
          <ThemeIcon $isVisible={!isDarkMode}>
            <FontAwesomeIcon icon={faSun} />
          </ThemeIcon>
        </ThemeToggle>

        <WelcomeModal />
      </AppContainer>
    </ThemeProvider>
  )
}
