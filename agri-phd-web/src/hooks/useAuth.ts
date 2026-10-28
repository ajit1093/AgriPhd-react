import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'

export function useAuth() {
  const { setUser, clearUser } = useAuthStore()
  const navigate = useNavigate()

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      if (!data.success || !data.user) {
        toast.error(data.errorMessage ?? 'Invalid Login ID or password.')
        return
      }

      // Map legacy ASPX dashboard paths → React routes
      const legacyToReact: Record<number, string> = {
        91: '/candidate/dashboard',
        11: '/super-admin/dashboard',
        12: '/admin/dashboard',
        61: '/college/dashboard',
        41: '/everification/dashboard',
        42: '/everification/dashboard',
        93: '/university/dashboard',
      }
      const targetRoute = legacyToReact[data.user.userTypeId] ?? '/candidate/dashboard'

      // Store the REACT path, not the raw legacy ASPX path from the SP
      setUser({
        userId:        data.user.userId,
        userLoginId:   data.user.userLoginId,
        userName:      data.user.userName,
        userTypeId:    data.user.userTypeId,
        dashboardPath: targetRoute,
        sessionId:     data.user.sessionId,
      })

      if (data.requiresSecurityQuestion) {
        navigate('/account/change-security-question', { replace: true })
      } else {
        navigate(targetRoute, { replace: true })
      }
    },
    onError: (error: unknown) => {
      // Login returns 401 with JSON body — extract the error message
      const axiosError = error as { response?: { data?: { errorMessage?: string } } }
      const msg = axiosError?.response?.data?.errorMessage ?? 'Unable to connect to the server. Please try again.'
      toast.error(msg)
    },
  })

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      clearUser()
      navigate('/login', { replace: true })
    },
  })

  return { loginMutation, logoutMutation }
}

/** Check if new candidate registration is open. */
export function useRegistrationOpen() {
  return useQuery<boolean>({
    queryKey: ['registration', 'is-open'],
    queryFn: async () => {
      try {
        const { apiClient } = await import('@/api/client')
        const res = await apiClient.get<{ isOpen: boolean }>('/notifications/registration-open')
        return res.data.isOpen
      } catch {
        return false
      }
    },
    staleTime: 60_000,
  })
}
