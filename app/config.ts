// API configuration
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const API_ENDPOINTS = {
  openai: `${API_BASE_URL}/api/openai`,
  shuffleQuestions: `${API_BASE_URL}/api/shuffle-questions`,
}
