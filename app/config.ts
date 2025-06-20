// API configuration
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://rabbit-trail-backend.onrender.com'

export const API_ENDPOINTS = {
  openai: `${API_BASE_URL}/api/openai`,
  shuffleQuestions: `${API_BASE_URL}/api/shuffle-questions`,
}
