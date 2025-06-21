# State Management Architecture

This document outlines the improved state management architecture for the Shallow Research frontend application.

## Overview

The application uses a **Context + useReducer** pattern that provides:

- **Centralized state management** with predictable updates
- **Type-safe actions** with comprehensive error handling
- **Performance optimization** through memoized selectors
- **Clean separation of concerns** between UI, business logic, and analytics
- **Easy testing** with isolated, pure functions

## Architecture Components

### 1. Core State (`app/state.ts`)

**AppState Interface:**

```typescript
interface AppState {
  // Input & Search
  inputText: string
  result: string
  currentQuery: string

  // Questions & Options
  options: string[]
  suggestedQuestions: string[]
  showSuggestedQuestions: boolean
  explorableConcepts: string[]

  // History
  historyEntries: HistoryItem[]
  conversationHistory: Array<{ role: string; content: string }>

  // UI State
  isLoading: boolean
  isSidebarVisible: boolean
  isDarkMode: boolean
  isModalVisible: boolean
  conciseness: 'short' | 'medium' | 'long'

  // Streaming & Animation
  isStreaming: boolean
  streamBuffer: string
  displayedText: string
  isTypewriterDone: boolean
}
```

**Improved Reducer Features:**

- ✅ **Type-safe actions** with discriminated unions
- ✅ **Input validation** with safe type coercion
- ✅ **Error handling** for malformed payloads
- ✅ **Immutable updates** using spread operator
- ✅ **Predictable state transitions**

### 2. Context Provider (`app/context/AppContext.tsx`)

**Provides:**

- Global state access
- Action dispatchers with built-in analytics
- API integration (OpenAI, shuffle)
- Event handlers for all UI interactions

**Key Features:**

- **Centralized event handling** - All user interactions go through context
- **Built-in analytics** - Automatic tracking without cluttering components
- **Memoized callbacks** - Prevents unnecessary re-renders
- **Error boundaries** - Graceful error handling

### 3. Selector Hooks (`app/hooks/useAppSelectors.ts`)

Performance-optimized hooks that only re-render when specific state slices change:

```typescript
// Only re-renders when input or loading state changes
const { inputText, isLoading } = useInputState()

// Only re-renders when search results change
const { result, currentQuery, isStreaming } = useSearchResults()

// Computed selectors for conditional rendering
const canShowSuggestedQuestions = useCanShowSuggestedQuestions()
```

## Usage Patterns

### 1. Component Structure

**Before (Monolithic):**

```typescript
export default function Home() {
  const [state, dispatch] = useReducer(appReducer, initialState)
  // 500+ lines of logic mixed with UI
}
```

**After (Modular):**

```typescript
// Clean, focused components
const SearchInput: React.FC = () => {
  const { inputText, isLoading } = useInputState()
  const { handleInputChange, handleOpenAI } = useAppActions()
  // Focused on single responsibility
}

export default function Home() {
  return (
    <AppContainer>
      <SearchInput />
      <SuggestedQuestions />
      <SearchResult />
      <FollowUpQuestions />
    </AppContainer>
  )
}
```

### 2. State Access Patterns

```typescript
// ✅ Use specific selectors for performance
const { isDarkMode, conciseness } = useUISettings()

// ✅ Use computed selectors for complex conditions
const canShowFollowUps = useCanShowFollowUps()

// ✅ Use actions for all state changes
const { handleThemeToggle, handleConcisenesChange } = useAppActions()

// ❌ Avoid accessing entire state unnecessarily
const state = useAppState() // Only use when you need multiple unrelated fields
```

### 3. Adding New Features

**1. Add to State Interface:**

```typescript
interface AppState {
  // ... existing fields
  newFeature: boolean
}
```

**2. Add Action Type:**

```typescript
export type AppAction = { type: 'SET_NEW_FEATURE'; payload: boolean }
// ... existing actions
```

**3. Handle in Reducer:**

```typescript
case 'SET_NEW_FEATURE': {
  return {
    ...state,
    newFeature: createSafeBoolean(action.payload),
  }
}
```

**4. Add to Context:**

```typescript
const handleNewFeature = useCallback(
  (value: boolean) => {
    analytics.ui.trackNewFeature(value)
    dispatch({ type: 'SET_NEW_FEATURE', payload: value })
  },
  [analytics.ui]
)
```

**5. Create Selector (if needed):**

```typescript
export const useNewFeatureState = () => {
  const state = useAppState()
  return useMemo(() => state.newFeature, [state.newFeature])
}
```

## Benefits of This Architecture

### 1. **Predictable State Updates**

- All state changes go through the reducer
- Type-safe actions prevent runtime errors
- Input validation prevents bad data

### 2. **Performance Optimization**

- Memoized selectors prevent unnecessary re-renders
- Component-specific hooks reduce re-render scope
- Efficient event handler memoization

### 3. **Developer Experience**

- Clear separation of concerns
- Easy to test individual pieces
- TypeScript provides excellent autocomplete
- Consistent patterns across the app

### 4. **Maintainability**

- Single source of truth for state
- Centralized business logic
- Easy to add features without breaking existing code
- Clear data flow: UI → Actions → Reducer → State → UI

### 5. **Analytics Integration**

- Automatic tracking without cluttering components
- Consistent event naming and parameters
- Easy to add/remove analytics without touching UI code

## Testing Strategy

### 1. **Reducer Testing**

```typescript
describe('appReducer', () => {
  it('handles SET_INPUT action', () => {
    const action = { type: 'SET_INPUT', payload: 'test query' }
    const newState = appReducer(initialState, action)
    expect(newState.inputText).toBe('test query')
  })
})
```

### 2. **Context Testing**

```typescript
const TestComponent = () => {
  const { handleInputChange } = useAppActions()
  return <button onClick={() => handleInputChange('test')}>Test</button>
}

// Test with provider wrapper
```

### 3. **Selector Testing**

```typescript
describe('useInputState', () => {
  it('only re-renders when input state changes', () => {
    // Test memoization behavior
  })
})
```

## Migration Guide

The refactoring maintains backward compatibility while providing new patterns:

1. **Existing components** continue to work with prop drilling
2. **New components** can use context hooks
3. **Gradual migration** - convert components one at a time
4. **No breaking changes** to existing APIs

## Performance Considerations

- **Memoization**: All selectors and event handlers are memoized
- **Selective re-rendering**: Components only re-render when their specific state slice changes
- **Efficient updates**: Reducer uses immutable patterns for optimal React reconciliation
- **Lazy evaluation**: Computed selectors only recalculate when dependencies change

## Future Enhancements

1. **Persistence**: Add localStorage integration for user preferences
2. **Undo/Redo**: Leverage the reducer pattern for time-travel debugging
3. **State Machines**: Consider XState for complex UI state transitions
4. **DevTools**: Add Redux DevTools integration for debugging
5. **Code Splitting**: Lazy load context providers for better performance
