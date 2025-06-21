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
  useQuizState,
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
  // Quiz components
  QuizButton,
  QuizContainer,
  QuizQuestionCard,
  QuizQuestionWrapper,
  QuizQuestionText,
  QuizOptionsGrid,
  QuizOption,
  QuizOptionLetter,
  QuizOptionText,
  QuizResultIndicator,
  QuizExplanation,
  QuizActions,
  QuizActionButton,
  QuizLoadingContainer,
  QuizScoreContainer,
  QuizScoreTitle,
  QuizScoreText,
  QuizScoreSubtext,
  QuizProgressBar,
  QuizProgressFill,
  QuizQuestionNumber,
  QuizNavigationDots,
  QuizNavigationDot,
  ModalScrollableContent,
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

const QuizMe: React.FC = () => {
  const { handleGenerateQuiz } = useAppContext()
  const { historyEntries } = useHistoryState()
  const { isGeneratingQuiz } = useQuizState()

  // Only show quiz button after at least 2 questions
  if (historyEntries.length < 2) {
    return null
  }

  return (
    <QuizButton onClick={handleGenerateQuiz} disabled={isGeneratingQuiz}>
      Quiz Me
    </QuizButton>
  )
}

const QuizModal: React.FC = () => {
  const {
    handleQuizAnswer,
    handleRevealQuizResults,
    handleCloseQuiz,
    handleNextQuestion,
    handlePreviousQuestion,
    dispatch,
  } = useAppContext()
  const {
    isQuizModalVisible,
    quizQuestions,
    userAnswers,
    showQuizResults,
    isGeneratingQuiz,
    currentQuestionIndex,
  } = useQuizState()

  const currentQuestion = useMemo(() => {
    return quizQuestions[currentQuestionIndex]
  }, [quizQuestions, currentQuestionIndex])

  const isLastQuestion = currentQuestionIndex === quizQuestions.length - 1
  const isFirstQuestion = currentQuestionIndex === 0

  const allQuestionsAnswered = useMemo(() => {
    return (
      quizQuestions.length > 0 &&
      quizQuestions.every((q) => userAnswers[q.id] !== undefined)
    )
  }, [quizQuestions, userAnswers])

  const score = useMemo(() => {
    if (!showQuizResults) return 0
    return quizQuestions.reduce((acc, question) => {
      return acc + (userAnswers[question.id] === question.correctAnswer ? 1 : 0)
    }, 0)
  }, [quizQuestions, userAnswers, showQuizResults])

  const handleOptionClick = useCallback(
    (answer: string) => {
      if (!showQuizResults && currentQuestion) {
        handleQuizAnswer(currentQuestion.id, answer)
      }
    },
    [showQuizResults, currentQuestion, handleQuizAnswer]
  )

  const handleDotClick = useCallback(
    (index: number) => {
      dispatch({ type: 'SET_CURRENT_QUESTION_INDEX', payload: index })
    },
    [dispatch]
  )

  if (!isQuizModalVisible) {
    return null
  }

  const progress = ((currentQuestionIndex + 1) / quizQuestions.length) * 100

  return (
    <ModalOverlay
      $isVisible={isQuizModalVisible}
      onClick={() => handleCloseQuiz()}
    >
      <ModalContainer
        $isVisible={isQuizModalVisible}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '600px' }}
      >
        <ModalCloseButton onClick={handleCloseQuiz}>×</ModalCloseButton>

        {isGeneratingQuiz ? (
          <QuizLoadingContainer>
            <ModalTitle>Creating Your Quiz</ModalTitle>
            <LoadingIndicator>
              Generating questions
              <span></span>
              <span></span>
              <span></span>
            </LoadingIndicator>
            <QuizScoreSubtext style={{ marginTop: '2rem' }}>
              We're creating personalized questions based on your conversation.
              <br />
              This quiz is temporary and won't be saved.
            </QuizScoreSubtext>
          </QuizLoadingContainer>
        ) : showQuizResults ? (
          <>
            <ModalTitle>Quiz Results</ModalTitle>
            <ModalScrollableContent>
              <QuizScoreContainer>
                <QuizScoreTitle>Quiz Complete!</QuizScoreTitle>
                <QuizScoreText>
                  {score} / {quizQuestions.length}
                </QuizScoreText>
                <QuizScoreSubtext>
                  {score === quizQuestions.length
                    ? "Perfect score! You've mastered this topic!"
                    : score >= quizQuestions.length * 0.7
                    ? 'Great job! You have a solid understanding.'
                    : 'Keep learning! Review the answers to improve.'}
                </QuizScoreSubtext>

                <QuizContainer>
                  {quizQuestions.map((question, index) => {
                    const userAnswer = userAnswers[question.id]
                    const isCorrect = userAnswer === question.correctAnswer

                    return (
                      <QuizQuestionCard
                        key={question.id}
                        style={{ '--index': index } as React.CSSProperties}
                      >
                        <QuizQuestionText>
                          {index + 1}. {question.question}
                        </QuizQuestionText>

                        <QuizOptionsGrid>
                          {(['A', 'B', 'C', 'D'] as const).map((letter) => (
                            <QuizOption
                              key={letter}
                              $isSelected={userAnswer === letter}
                              $isCorrect={question.correctAnswer === letter}
                              $isIncorrect={
                                userAnswer === letter &&
                                userAnswer !== question.correctAnswer
                              }
                              $showResults={true}
                              onClick={() => {}}
                            >
                              <QuizOptionLetter>{letter}</QuizOptionLetter>
                              <QuizOptionText>
                                {question.options[letter]}
                              </QuizOptionText>
                              {question.correctAnswer === letter && (
                                <QuizResultIndicator $isCorrect={true}>
                                  ✓
                                </QuizResultIndicator>
                              )}
                              {userAnswer === letter &&
                                userAnswer !== question.correctAnswer && (
                                  <QuizResultIndicator $isCorrect={false}>
                                    ✗
                                  </QuizResultIndicator>
                                )}
                            </QuizOption>
                          ))}
                        </QuizOptionsGrid>

                        {question.explanation && (
                          <QuizExplanation>
                            <strong>Explanation:</strong> {question.explanation}
                          </QuizExplanation>
                        )}
                      </QuizQuestionCard>
                    )
                  })}
                </QuizContainer>
              </QuizScoreContainer>
            </ModalScrollableContent>

            <QuizActions>
              <QuizActionButton $variant="primary" onClick={handleCloseQuiz}>
                Done
              </QuizActionButton>
            </QuizActions>
          </>
        ) : currentQuestion ? (
          <>
            <ModalTitle>Test Your Knowledge</ModalTitle>

            <QuizProgressBar>
              <QuizProgressFill $progress={progress} />
            </QuizProgressBar>

            <QuizQuestionNumber>
              Question {currentQuestionIndex + 1} of {quizQuestions.length}
            </QuizQuestionNumber>

            <QuizContainer>
              <QuizQuestionWrapper key={currentQuestionIndex}>
                <QuizQuestionCard>
                  <QuizQuestionText>
                    {currentQuestion.question}
                  </QuizQuestionText>

                  <QuizOptionsGrid>
                    {(['A', 'B', 'C', 'D'] as const).map((letter) => {
                      const userAnswer = userAnswers[currentQuestion.id]
                      return (
                        <QuizOption
                          key={letter}
                          $isSelected={userAnswer === letter}
                          $isCorrect={false}
                          $isIncorrect={false}
                          $showResults={false}
                          onClick={() => handleOptionClick(letter)}
                        >
                          <input
                            type="radio"
                            name={`question-${currentQuestion.id}`}
                            checked={userAnswer === letter}
                            onChange={() => {}}
                          />
                          <QuizOptionLetter>{letter}</QuizOptionLetter>
                          <QuizOptionText>
                            {currentQuestion.options[letter]}
                          </QuizOptionText>
                        </QuizOption>
                      )
                    })}
                  </QuizOptionsGrid>
                </QuizQuestionCard>
              </QuizQuestionWrapper>
            </QuizContainer>

            <QuizNavigationDots>
              {quizQuestions.map((_, index) => (
                <QuizNavigationDot
                  key={index}
                  $isActive={index === currentQuestionIndex}
                  $isAnswered={
                    userAnswers[quizQuestions[index].id] !== undefined
                  }
                  onClick={() => handleDotClick(index)}
                />
              ))}
            </QuizNavigationDots>

            <QuizActions>
              {!isFirstQuestion && (
                <QuizActionButton
                  $variant="secondary"
                  onClick={handlePreviousQuestion}
                >
                  Previous
                </QuizActionButton>
              )}

              {!isLastQuestion ? (
                <QuizActionButton
                  $variant="primary"
                  onClick={handleNextQuestion}
                >
                  Next
                </QuizActionButton>
              ) : (
                <QuizActionButton
                  $variant="primary"
                  onClick={handleRevealQuizResults}
                  disabled={!allQuestionsAnswered}
                >
                  Submit Quiz
                </QuizActionButton>
              )}
            </QuizActions>
          </>
        ) : null}
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

        <QuizMe />
        <QuizModal />
        <WelcomeModal />
      </AppContainer>
    </ThemeProvider>
  )
}
