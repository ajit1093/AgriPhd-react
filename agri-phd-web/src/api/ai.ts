import { apiClient } from './client'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface AdmissionChatResponse {
  reply: string
  language: string
  suggestions: string[]
  relatedTopics: string[]
}

export const aiApi = {
  chat: async (message: string, history: ChatMessage[] = [], language?: string) => {
    const res = await apiClient.post<AdmissionChatResponse>('/ai/admission-chat', {
      message,
      history,
      language,
    })
    return res.data
  },
}
