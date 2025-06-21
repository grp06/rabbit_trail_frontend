# State Management Usage Examples

This document provides practical examples of how to use the new state management architecture.

## Basic Component Patterns

### 1. Simple State Access

```typescript
import { useUISettings } from './hooks/useAppSelectors'

const ThemeButton: React.FC = () => {
  const { isDarkMode } = useUISettings()
  const { handleThemeToggle } = useAppActions()

  return <button onClick={handleThemeToggle}>{isDarkMode ? '🌙' : '☀️'}</button>
}
```

### 2. Performance-Optimized Component

```typescript
import { useSearchResults, useCanShowResult } from './hooks/useAppSelectors'

const SearchResultDisplay: React.FC = () => {
  // Only re-renders when search results change
  const { result, isLoading, currentQuery } = useSearchResults()

  // Only re-renders when visibility conditions change
  const canShow = useCanShowResult()

  if (!canShow) return null

  return (
    <div>
      <h3>{currentQuery}</h3>
      {isLoading ? <LoadingSpinner /> : <div>{result}</div>}
    </div>
  )
}
```

### 3. Form Input with State Management

```typescript
import { useInputState } from './hooks/useAppSelectors'

const SearchForm: React.FC = () => {
  const { inputText, isLoading } = useInputState()
  const { handleInputChange, handleOpenAI } = useAppActions()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputText.trim()) {
      handleOpenAI(inputText, false, false)
      handleInputChange('')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={inputText}
        onChange={(e) => handleInputChange(e.target.value)}
        disabled={isLoading}
        placeholder="Ask a question..."
      />
    </form>
  )
}
```

## Advanced Patterns

### 1. Custom Hook with Multiple Selectors

```typescript
import { useSearchResults, useQuestionOptions } from './hooks/useAppSelectors'

const useSearchDisplay = () => {
  const searchResults = useSearchResults()
  const questionOptions = useQuestionOptions()

  return {
    ...searchResults,
    ...questionOptions,
    hasContent: searchResults.result || questionOptions.options.length > 0,
    isReady: searchResults.isTypewriterDone && !searchResults.isLoading,
  }
}

// Usage in component
const SearchDisplayComponent: React.FC = () => {
  const { result, options, hasContent, isReady } = useSearchDisplay()

  return (
    <div>
      {hasContent && isReady && (
        <>
          <div>{result}</div>
          <FollowUpQuestions options={options} />
        </>
      )}
    </div>
  )
}
```

### 2. Conditional Rendering with Computed State

```typescript
import {
  useCanShowSuggestedQuestions,
  useCanShowFollowUps,
} from './hooks/useAppSelectors'

const QuestionSection: React.FC = () => {
  const showSuggested = useCanShowSuggestedQuestions()
  const showFollowUps = useCanShowFollowUps()

  return (
    <div>
      {showSuggested && <SuggestedQuestions />}
      {showFollowUps && <FollowUpQuestions />}
    </div>
  )
}
```

### 3. Analytics Integration

```typescript
import { useAppContext } from './context/AppContext'

const AnalyticsButton: React.FC<{ label: string }> = ({ label }) => {
  const { analytics } = useAppContext()

  const handleClick = () => {
    // Direct access to analytics for custom tracking
    analytics.ui.trackCustomEvent('button_click', { label })

    // Your button logic here
  }

  return <button onClick={handleClick}>{label}</button>
}
```

## Component Composition Examples

### 1. Modular Search Interface

```typescript
// Main container
const SearchInterface: React.FC = () => {
  return (
    <div>
      <SearchInput />
      <SearchResults />
      <QuestionOptions />
    </div>
  )
}

// Individual components
const SearchInput: React.FC = () => {
  const { inputText, isLoading } = useInputState()
  const { handleInputChange, handleOpenAI } = useAppActions()

  // Component logic...
}

const SearchResults: React.FC = () => {
  const { result, currentQuery } = useSearchResults()
  const canShow = useCanShowResult()

  // Component logic...
}

const QuestionOptions: React.FC = () => {
  const showSuggested = useCanShowSuggestedQuestions()
  const showFollowUps = useCanShowFollowUps()

  // Component logic...
}
```

### 2. Sidebar with History

```typescript
const HistorySidebar: React.FC = () => {
  const { historyEntries } = useHistoryData()
  const { isSidebarVisible } = useUISettings()
  const { loadHistoryEntry, handleRevert } = useAppActions()

  if (!isSidebarVisible) return null

  return (
    <aside>
      {historyEntries.map((entry, index) => (
        <div key={index}>
          <button onClick={() => loadHistoryEntry(entry)}>
            {entry.queryText}
          </button>
          <button onClick={() => handleRevert(entry, index)}>Revert</button>
        </div>
      ))}
    </aside>
  )
}
```

## Testing Examples

### 1. Testing Components with Context

```typescript
import { render, screen } from '@testing-library/react'
import { AppProvider } from './context/AppContext'
import { SearchForm } from './components/SearchForm'

const renderWithContext = (component: React.ReactElement) => {
  return render(<AppProvider>{component}</AppProvider>)
}

describe('SearchForm', () => {
  it('renders input field', () => {
    renderWithContext(<SearchForm />)
    expect(screen.getByPlaceholderText('Ask a question...')).toBeInTheDocument()
  })
})
```

### 2. Testing Selectors

```typescript
import { renderHook } from '@testing-library/react'
import { useInputState } from './hooks/useAppSelectors'
import { AppProvider } from './context/AppContext'

describe('useInputState', () => {
  it('returns current input state', () => {
    const { result } = renderHook(() => useInputState(), {
      wrapper: AppProvider,
    })

    expect(result.current.inputText).toBe('')
    expect(result.current.isLoading).toBe(false)
  })
})
```

## Migration Examples

### 1. Before: Prop Drilling

```typescript
// ❌ Old way - lots of prop drilling
const App = () => {
  const [state, dispatch] = useReducer(appReducer, initialState)

  return (
    <MainComponent
      state={state}
      dispatch={dispatch}
      onInputChange={(value) => dispatch({ type: 'SET_INPUT', payload: value })}
      onThemeToggle={() => dispatch({ type: 'TOGGLE_THEME' })}
    />
  )
}

const MainComponent = ({ state, dispatch, onInputChange, onThemeToggle }) => {
  return (
    <div>
      <SearchInput
        value={state.inputText}
        onChange={onInputChange}
        isLoading={state.isLoading}
      />
      <ThemeButton onClick={onThemeToggle} isDark={state.isDarkMode} />
    </div>
  )
}
```

### 2. After: Context

```typescript
// ✅ New way - clean context usage
const App = () => {
  return (
    <AppProvider>
      <MainComponent />
    </AppProvider>
  )
}

const MainComponent = () => {
  return (
    <div>
      <SearchInput />
      <ThemeButton />
    </div>
  )
}

const SearchInput = () => {
  const { inputText, isLoading } = useInputState()
  const { handleInputChange } = useAppActions()

  return (
    <input
      value={inputText}
      onChange={(e) => handleInputChange(e.target.value)}
      disabled={isLoading}
    />
  )
}

const ThemeButton = () => {
  const { isDarkMode } = useUISettings()
  const { handleThemeToggle } = useAppActions()

  return (
    <button onClick={handleThemeToggle}>{isDarkMode ? 'Light' : 'Dark'}</button>
  )
}
```

## Performance Best Practices

### 1. Use Specific Selectors

```typescript
// ✅ Good - only re-renders when input changes
const { inputText } = useInputState()

// ❌ Avoid - re-renders on any state change
const { inputText } = useAppState()
```

### 2. Memoize Expensive Computations

```typescript
const SearchResults = () => {
  const { result, explorableConcepts } = useSearchResults()

  // Memoize expensive highlighting logic
  const highlightedResult = useMemo(() => {
    return highlightConcepts(result, explorableConcepts)
  }, [result, explorableConcepts])

  return <div>{highlightedResult}</div>
}
```

### 3. Use Computed Selectors for Complex Logic

```typescript
// ✅ Good - computed selector handles complexity
const canShowContent = useCanShowResult()

// ❌ Avoid - complex logic in component
const { currentQuery, result, isLoading, isStreaming } = useSearchResults()
const canShowContent = currentQuery && (result || isLoading || isStreaming)
```

## Common Patterns

### 1. Loading States

```typescript
const LoadingAwareComponent = () => {
  const { isLoading } = useSearchResults()

  if (isLoading) return <LoadingSpinner />

  return <MainContent />
}
```

### 2. Error Boundaries

```typescript
const ErrorBoundaryComponent = () => {
  const { error } = useAppState()

  if (error) {
    return <ErrorDisplay error={error} />
  }

  return <NormalContent />
}
```

### 3. Conditional Features

```typescript
const FeatureToggleComponent = () => {
  const { conciseness } = useUISettings()

  return (
    <div>
      <BasicContent />
      {conciseness === 'long' && <DetailedContent />}
    </div>
  )
}
```
