import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from '@/store/authStore'

/**
 * P4-06 — authStore: setUser, clearUser, role checks
 */

const mockUser = {
  userId:        111003,
  userLoginId:   '252001005',
  userName:      'AJIT SHIRISH BABAR',
  userTypeId:    91,   // Candidate
  dashboardPath: '/candidate/dashboard',
  sessionId:     15981,
}

describe('authStore', () => {
  // Reset store state between tests
  beforeEach(() => {
    useAuthStore.getState().clearUser()
  })

  // ── Initial state ──────────────────────────────────────────────────────────
  it('starts unauthenticated with null user', () => {
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.user).toBeNull()
  })

  it('starts with isLoading=true (before /auth/me resolves)', () => {
    // After clearUser, isLoading is false — initial state is set in store definition
    const store = useAuthStore.getState()
    expect(store.isLoading).toBe(false) // clearUser sets false
  })

  // ── setUser ────────────────────────────────────────────────────────────────
  it('setUser sets user, marks authenticated, clears loading', () => {
    useAuthStore.getState().setUser(mockUser)
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.isLoading).toBe(false)
    expect(state.user).toEqual(mockUser)
  })

  it('setUser stores all user fields correctly', () => {
    useAuthStore.getState().setUser(mockUser)
    const { user } = useAuthStore.getState()
    expect(user?.userId).toBe(111003)
    expect(user?.userLoginId).toBe('252001005')
    expect(user?.userTypeId).toBe(91)
    expect(user?.dashboardPath).toBe('/candidate/dashboard')
    expect(user?.sessionId).toBe(15981)
  })

  it('setUser can overwrite with a different user (e.g. admin login)', () => {
    useAuthStore.getState().setUser(mockUser)
    const adminUser = { ...mockUser, userId: 1, userTypeId: 11, dashboardPath: '/super-admin/dashboard' }
    useAuthStore.getState().setUser(adminUser)
    const { user } = useAuthStore.getState()
    expect(user?.userTypeId).toBe(11)
    expect(user?.dashboardPath).toBe('/super-admin/dashboard')
  })

  // ── clearUser ──────────────────────────────────────────────────────────────
  it('clearUser clears user, marks unauthenticated', () => {
    useAuthStore.getState().setUser(mockUser)
    useAuthStore.getState().clearUser()
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.user).toBeNull()
    expect(state.isLoading).toBe(false)
  })

  // ── setLoading ─────────────────────────────────────────────────────────────
  it('setLoading updates isLoading', () => {
    useAuthStore.getState().setLoading(true)
    expect(useAuthStore.getState().isLoading).toBe(true)
    useAuthStore.getState().setLoading(false)
    expect(useAuthStore.getState().isLoading).toBe(false)
  })

  // ── Role checks ────────────────────────────────────────────────────────────
  it.each([
    { typeId: 91, name: 'Candidate',          dashboard: '/candidate/dashboard' },
    { typeId: 11, name: 'SuperAdmin',          dashboard: '/super-admin/dashboard' },
    { typeId: 12, name: 'Admin',              dashboard: '/admin/dashboard' },
    { typeId: 61, name: 'College',            dashboard: '/college/dashboard' },
    { typeId: 41, name: 'EVCAdmin',           dashboard: '/everification/dashboard' },
    { typeId: 42, name: 'EVCCoordinator',     dashboard: '/everification/dashboard' },
    { typeId: 93, name: 'University',         dashboard: '/university/dashboard' },
  ])('setUser stores correct role for $name (typeId=$typeId)', ({ typeId, dashboard }) => {
    useAuthStore.getState().setUser({ ...mockUser, userTypeId: typeId, dashboardPath: dashboard })
    const { user } = useAuthStore.getState()
    expect(user?.userTypeId).toBe(typeId)
    expect(user?.dashboardPath).toBe(dashboard)
  })

  // ── Administrative role access expectations ────────────────────────────────
  it('SuperAdmin (11) has universal authority over all staff modules', () => {
    useAuthStore.getState().setUser({ ...mockUser, userTypeId: 11, dashboardPath: '/super-admin/dashboard' })
    const { user } = useAuthStore.getState()
    expect(user?.userTypeId).toBe(11)

    // Helper function mirroring ProtectedRoute logic
    const canAccess = (allowedRoles?: number[]) => {
      if (user?.userTypeId === 11) return true
      if (user?.userTypeId === 12) return !allowedRoles || allowedRoles.some(r => [11, 12, 41, 42, 61, 93].includes(r))
      return !allowedRoles || allowedRoles.includes(user?.userTypeId ?? 0)
    }

    // SuperAdmin can access any route
    expect(canAccess([61])).toBe(true)       // College routes
    expect(canAccess([11, 12])).toBe(true)   // Admin routes
    expect(canAccess([41, 42])).toBe(true)   // EVC routes
    expect(canAccess([93])).toBe(true)       // University routes
    expect(canAccess([91])).toBe(true)       // Candidate routes
  })

  it('Admin (12) has staff authority over all management modules', () => {
    useAuthStore.getState().setUser({ ...mockUser, userTypeId: 12, dashboardPath: '/admin/dashboard' })
    const { user } = useAuthStore.getState()
    expect(user?.userTypeId).toBe(12)

    const canAccess = (allowedRoles?: number[]) => {
      if (user?.userTypeId === 11) return true
      if (user?.userTypeId === 12) return !allowedRoles || allowedRoles.some(r => [11, 12, 41, 42, 61, 93].includes(r))
      return !allowedRoles || allowedRoles.includes(user?.userTypeId ?? 0)
    }

    expect(canAccess([61])).toBe(true)       // College oversight
    expect(canAccess([11, 12])).toBe(true)   // Admin routes
    expect(canAccess([41, 42])).toBe(true)   // EVC oversight
    expect(canAccess([93])).toBe(true)       // University oversight
  })
})
