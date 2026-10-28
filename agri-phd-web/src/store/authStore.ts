import { create } from 'zustand'

/**
 * Shape of the logged-in user — populated from JWT claims via GET /api/v1/auth/me
 * Mirrors the LoggedInUser session object from the legacy ASP.NET app.
 */
export interface LoggedInUser {
  userId: number
  userLoginId: string
  userName: string
  userTypeId: number   // 11=SuperAdmin 12=Admin 41=EVCAdmin 42=EVCCoordinator 61=College 91=Candidate 93=University
  dashboardPath: string
  sessionId: number
}

interface AuthState {
  user: LoggedInUser | null
  isAuthenticated: boolean
  isLoading: boolean  // true while /auth/me is in-flight on app load

  setUser: (user: LoggedInUser) => void
  clearUser: () => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start true; resolved once /auth/me finishes

  setUser: (user) => set({ user, isAuthenticated: true, isLoading: false }),
  clearUser: () => set({ user: null, isAuthenticated: false, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
}))
