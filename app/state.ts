export interface HistoryItem {
  queryText: string
  responseText: string
  suggestedFollowups: string[]
  explorableConcepts: string[]
  conversationHistoryIndex: number // Position in conversation history when this query was made
}

// Quiz question interface
export interface QuizQuestion {
  id: number
  question: string
  options: {
    A: string
    B: string
    C: string
    D: string
  }
  correctAnswer: 'A' | 'B' | 'C' | 'D'
  explanation?: string
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
  isStreaming: boolean
  streamBuffer: string
  displayedText: string
  isTypewriterDone: boolean
  isConcisenessSidebarVisible: boolean
  // Quiz state
  isQuizModalVisible: boolean
  quizQuestions: QuizQuestion[]
  userAnswers: Record<number, string>
  showQuizResults: boolean
  isGeneratingQuiz: boolean
  currentQuestionIndex: number
}

// Action types with better type safety
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
  | { type: 'SET_TYPEWRITER_DONE'; payload: boolean }
  | { type: 'SET_CONCISENESS_SIDEBAR_VISIBLE'; payload: boolean }
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
  | { type: 'RESET_ALL_STATE' }
  // Quiz actions
  | { type: 'SET_QUIZ_MODAL_VISIBLE'; payload: boolean }
  | { type: 'SET_QUIZ_QUESTIONS'; payload: QuizQuestion[] }
  | { type: 'SET_USER_ANSWER'; payload: { questionId: number; answer: string } }
  | { type: 'SHOW_QUIZ_RESULTS'; payload: boolean }
  | { type: 'RESET_QUIZ' }
  | { type: 'SET_GENERATING_QUIZ'; payload: boolean }
  | { type: 'SET_CURRENT_QUESTION_INDEX'; payload: number }
  | { type: 'NEXT_QUESTION' }
  | { type: 'PREVIOUS_QUESTION' }

// Function to shuffle array and pick random questions
export function getRandomQuestions(
  questions: string[],
  count: number = 6
): string[] {
  if (!Array.isArray(questions) || questions.length === 0) {
    return []
  }
  const shuffled = [...questions].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, Math.min(count, questions.length))
}

// Helper functions for reducer logic
const createSafeArray = <T>(input: unknown): T[] => {
  return Array.isArray(input) ? input : []
}

const createSafeString = (input: unknown): string => {
  return typeof input === 'string' ? input : ''
}

const createSafeBoolean = (input: unknown): boolean => {
  return typeof input === 'boolean' ? input : false
}

// Improved reducer with better predictability and error handling
export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_INPUT': {
      const inputText = createSafeString(action.payload)
      return {
        ...state,
        inputText,
        // Hide suggested questions when user starts typing
        showSuggestedQuestions:
          inputText.trim() === '' ? state.showSuggestedQuestions : false,
      }
    }

    case 'SET_RESULT': {
      return {
        ...state,
        result: createSafeString(action.payload),
      }
    }

    case 'SET_OPTIONS': {
      return {
        ...state,
        options: createSafeArray<string>(action.payload),
      }
    }

    case 'SET_EXPLORABLE_CONCEPTS': {
      return {
        ...state,
        explorableConcepts: createSafeArray<string>(action.payload),
      }
    }

    case 'SET_LOADING': {
      return {
        ...state,
        isLoading: createSafeBoolean(action.payload),
      }
    }

    case 'SET_SIDEBAR_VISIBLE': {
      return {
        ...state,
        isSidebarVisible: createSafeBoolean(action.payload),
      }
    }

    case 'ADD_HISTORY_ENTRY': {
      const newEntry = action.payload
      if (!newEntry || typeof newEntry !== 'object') {
        return state
      }

      return {
        ...state,
        historyEntries: [newEntry, ...state.historyEntries],
        // Auto-open sidebar on desktop only
        isSidebarVisible:
          typeof window !== 'undefined' && window.innerWidth > 768
            ? true
            : state.isSidebarVisible,
      }
    }

    case 'SET_HISTORY_ENTRIES': {
      return {
        ...state,
        historyEntries: createSafeArray<HistoryItem>(action.payload),
      }
    }

    case 'SET_CURRENT_QUERY': {
      return {
        ...state,
        currentQuery: createSafeString(action.payload),
      }
    }

    case 'SET_CONCISENESS': {
      const validValues: AppState['conciseness'][] = ['short', 'medium', 'long']
      const newValue = validValues.includes(action.payload)
        ? action.payload
        : 'short'
      return {
        ...state,
        conciseness: newValue,
      }
    }

    case 'SET_DRAGGING': {
      return {
        ...state,
        isDragging: createSafeBoolean(action.payload),
      }
    }

    case 'TOGGLE_THEME': {
      return {
        ...state,
        isDarkMode: !state.isDarkMode,
      }
    }

    case 'SET_MODAL_VISIBLE': {
      return {
        ...state,
        isModalVisible: createSafeBoolean(action.payload),
      }
    }

    case 'HIDE_SUGGESTED_QUESTIONS': {
      return {
        ...state,
        showSuggestedQuestions: false,
      }
    }

    case 'SET_SUGGESTED_QUESTIONS': {
      return {
        ...state,
        suggestedQuestions: createSafeArray<string>(action.payload),
        showSuggestedQuestions: true,
      }
    }

    case 'SET_STREAMING': {
      return {
        ...state,
        isStreaming: createSafeBoolean(action.payload),
      }
    }

    case 'UPDATE_STREAM_BUFFER': {
      return {
        ...state,
        streamBuffer: createSafeString(action.payload),
      }
    }

    case 'UPDATE_DISPLAYED_TEXT': {
      return {
        ...state,
        displayedText: createSafeString(action.payload),
      }
    }

    case 'RESET_STREAMING': {
      return {
        ...state,
        isStreaming: false,
        streamBuffer: '',
        displayedText: '',
        isTypewriterDone: false,
      }
    }

    case 'SET_TYPEWRITER_DONE': {
      return {
        ...state,
        isTypewriterDone: createSafeBoolean(action.payload),
      }
    }

    case 'SET_CONCISENESS_SIDEBAR_VISIBLE': {
      return {
        ...state,
        isConcisenessSidebarVisible: createSafeBoolean(action.payload),
      }
    }

    case 'ADD_CONVERSATION_HISTORY': {
      const newMessages = createSafeArray<{ role: string; content: string }>(
        action.payload
      )
      return {
        ...state,
        conversationHistory: [...state.conversationHistory, ...newMessages],
      }
    }

    case 'SET_CONVERSATION_HISTORY': {
      return {
        ...state,
        conversationHistory: createSafeArray<{ role: string; content: string }>(
          action.payload
        ),
      }
    }

    case 'LOAD_HISTORY_ENTRY': {
      const entry = action.payload
      if (!entry || typeof entry !== 'object') {
        return state
      }

      const {
        queryText,
        responseText,
        suggestedFollowups,
        explorableConcepts,
      } = entry

      return {
        ...state,
        currentQuery: createSafeString(queryText),
        result: createSafeString(responseText),
        options: createSafeArray<string>(suggestedFollowups),
        explorableConcepts: createSafeArray<string>(explorableConcepts),
        // Reset streaming state when loading history
        isStreaming: false,
        streamBuffer: '',
        displayedText: createSafeString(responseText),
        isTypewriterDone: true,
      }
    }

    case 'RESET_QUERY_STATE': {
      return {
        ...state,
        result: '',
        options: [],
        explorableConcepts: [],
        isStreaming: false,
        streamBuffer: '',
        displayedText: '',
        isTypewriterDone: false,
      }
    }

    case 'RESET_ALL_STATE': {
      return {
        ...initialState,
        // Preserve some user preferences
        isDarkMode: state.isDarkMode,
        conciseness: state.conciseness,
      }
    }

    case 'SET_QUIZ_MODAL_VISIBLE': {
      return {
        ...state,
        isQuizModalVisible: createSafeBoolean(action.payload),
      }
    }

    case 'SET_QUIZ_QUESTIONS': {
      return {
        ...state,
        quizQuestions: createSafeArray<QuizQuestion>(action.payload),
      }
    }

    case 'SET_USER_ANSWER': {
      const { questionId, answer } = action.payload
      return {
        ...state,
        userAnswers: {
          ...state.userAnswers,
          [questionId]: answer,
        },
      }
    }

    case 'SHOW_QUIZ_RESULTS': {
      return {
        ...state,
        showQuizResults: action.payload === true,
      }
    }

    case 'RESET_QUIZ': {
      return {
        ...state,
        userAnswers: {},
        showQuizResults: false,
        currentQuestionIndex: 0,
      }
    }

    case 'SET_GENERATING_QUIZ': {
      return {
        ...state,
        isGeneratingQuiz: createSafeBoolean(action.payload),
      }
    }

    case 'SET_CURRENT_QUESTION_INDEX': {
      return {
        ...state,
        currentQuestionIndex:
          typeof action.payload === 'number' ? action.payload : 0,
      }
    }

    case 'NEXT_QUESTION': {
      return {
        ...state,
        currentQuestionIndex: Math.min(
          state.currentQuestionIndex + 1,
          state.quizQuestions.length - 1
        ),
      }
    }

    case 'PREVIOUS_QUESTION': {
      return {
        ...state,
        currentQuestionIndex: Math.max(state.currentQuestionIndex - 1, 0),
      }
    }

    default: {
      // TypeScript will ensure this is never reached with proper typing
      console.warn('Unknown action type:', (action as any).type)
      return state
    }
  }
}

// Initial state with better defaults
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
  isTypewriterDone: false,
  isConcisenessSidebarVisible: true,
  isQuizModalVisible: false,
  quizQuestions: [],
  userAnswers: {},
  showQuizResults: false,
  isGeneratingQuiz: false,
  currentQuestionIndex: 0,
}
