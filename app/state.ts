export interface HistoryItem {
  queryText: string
  responseText: string
  suggestedFollowups: string[]
  explorableConcepts: string[]
  conversationHistoryIndex: number // Position in conversation history when this query was made
}

// Consolidated state interface
export interface AppState {
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
  // Typewriter animation state
  isStreaming: boolean
  streamBuffer: string
  displayedText: string
}

// Action types
export type AppAction =
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
  | { type: 'SET_STREAMING'; payload: boolean }
  | { type: 'UPDATE_STREAM_BUFFER'; payload: string }
  | { type: 'UPDATE_DISPLAYED_TEXT'; payload: string }
  | { type: 'RESET_STREAMING' }
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
export function getRandomQuestions(
  questions: string[],
  count: number = 6
): string[] {
  const shuffled = [...questions].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

// Reducer function
export function appReducer(state: AppState, action: AppAction): AppState {
  const { type } = action
  const payload = 'payload' in action ? action.payload : undefined

  switch (type) {
    case 'SET_INPUT':
      const { showSuggestedQuestions, ...restState } = state

      return {
        ...restState,
        inputText: payload as string,
        // Hide suggested questions when user starts typing
        showSuggestedQuestions:
          (payload as string).trim() === '' ? showSuggestedQuestions : false,
      }
    case 'SET_RESULT':
      return { ...state, result: payload as string }
    case 'SET_OPTIONS':
      return { ...state, options: payload as string[] }
    case 'SET_EXPLORABLE_CONCEPTS':
      return { ...state, explorableConcepts: payload as string[] }
    case 'SET_LOADING':
      return { ...state, isLoading: payload as boolean }
    case 'SET_SIDEBAR_VISIBLE':
      return { ...state, isSidebarVisible: payload as boolean }
    case 'ADD_HISTORY_ENTRY':
      const { historyEntries, ...stateWithoutHistory } = state
      return {
        ...stateWithoutHistory,
        historyEntries: [payload as HistoryItem, ...historyEntries],
        // Only auto-open sidebar on desktop (screen width > 768px)
        isSidebarVisible:
          typeof window !== 'undefined' && window.innerWidth > 768
            ? true
            : state.isSidebarVisible,
      }
    case 'SET_HISTORY_ENTRIES':
      return { ...state, historyEntries: payload as HistoryItem[] }
    case 'SET_CURRENT_QUERY':
      return { ...state, currentQuery: payload as string }
    case 'SET_CONCISENESS':
      return { ...state, conciseness: payload as 'short' | 'medium' | 'long' }
    case 'SET_DRAGGING':
      return { ...state, isDragging: payload as boolean }
    case 'TOGGLE_THEME':
      const { isDarkMode } = state
      return { ...state, isDarkMode: !isDarkMode }
    case 'SET_MODAL_VISIBLE':
      return { ...state, isModalVisible: payload as boolean }
    case 'HIDE_SUGGESTED_QUESTIONS':
      return { ...state, showSuggestedQuestions: false }
    case 'SET_SUGGESTED_QUESTIONS':
      return { ...state, suggestedQuestions: payload as string[] }
    case 'SET_STREAMING':
      return { ...state, isStreaming: payload as boolean }
    case 'UPDATE_STREAM_BUFFER':
      return { ...state, streamBuffer: payload as string }
    case 'UPDATE_DISPLAYED_TEXT':
      return { ...state, displayedText: payload as string }
    case 'RESET_STREAMING':
      return {
        ...state,
        isStreaming: false,
        streamBuffer: '',
        displayedText: '',
      }
    case 'ADD_CONVERSATION_HISTORY':
      const { conversationHistory } = state
      return {
        ...state,
        conversationHistory: [
          ...conversationHistory,
          ...(payload as { role: string; content: string }[]),
        ],
      }
    case 'SET_CONVERSATION_HISTORY':
      return {
        ...state,
        conversationHistory: payload as Array<{
          role: string
          content: string
        }>,
      }
    case 'LOAD_HISTORY_ENTRY':
      const {
        queryText,
        responseText,
        suggestedFollowups,
        explorableConcepts,
      } = payload as HistoryItem

      return {
        ...state,
        currentQuery: queryText,
        result: responseText,
        options: suggestedFollowups,
        explorableConcepts,
      }
    case 'RESET_QUERY_STATE':
      return {
        ...state,
        result: '',
        options: [],
        explorableConcepts: [],
        isStreaming: false,
        streamBuffer: '',
        displayedText: '',
      }
    default:
      return state
  }
}

// Initial state
export const initialState: AppState = {
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
  isStreaming: false,
  streamBuffer: '',
  displayedText: '',
}
