import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { appFormApi } from '@/api/applicationForm'

interface WizardRouteProps {
  /** PageCode passed to ApplicationForm_CheckURL SP */
  pageCode: string
}

/**
 * P2-D-00B — WizardRoute
 *
 * On every wizard page mount, calls ApplicationForm_CheckURL SP.
 * If IsRightURL = false → redirects to RightURL (the correct next step).
 * Matches legacy: on every ASPX page load, CheckURL is called and wrong-page gets redirected.
 *
 * Usage:
 *   <Route element={<WizardRoute pageCode="Personal" />}>
 *     <Route path="/candidate/application-form/personal" element={<PersonalPage />} />
 *   </Route>
 */
export function WizardRoute({ pageCode }: WizardRouteProps) {
  const navigate = useNavigate()

  const { data } = useQuery({
    queryKey: ['wizard-check-url', pageCode],
    queryFn:  () => appFormApi.checkUrl(pageCode),
    staleTime: 0, // always re-check on mount
    gcTime:    0,
  })

  useEffect(() => {
    if (data && !data.isRightURL && data.rightURL) {
      // RightURL from SP is a relative path like "../Candidate/Personal.aspx"
      // Map legacy page names to React routes
      const legacyToRoute: Record<string, string> = {
        'Personal.aspx':                       '/candidate/application-form/personal',
        'Address.aspx':                        '/candidate/application-form/address',
        'CategoryAndOtherReservation.aspx':    '/candidate/application-form/category',
        'Qualification.aspx':                  '/candidate/application-form/qualification',
        'ApplicationFormResearchPaper.aspx':   '/candidate/application-form/research-paper',
        'ShortListOptions.aspx':               '/candidate/application-form/shortlist',
        'UploadPhotoAndSign.aspx':             '/candidate/application-form/photo-sign',
        'UploadRequiredDocuments.aspx':        '/candidate/application-form/documents',
        'PayApplicationFee.aspx':              '/candidate/application-form/pay-fee',
        'ApplicationFormSummary.aspx':         '/candidate/application-form/summary',
      }

      const rightPage = Object.entries(legacyToRoute).find(([legacy]) =>
        data.rightURL.includes(legacy)
      )
      if (rightPage) navigate(rightPage[1], { replace: true })
    }
  }, [data, navigate])

  return <Outlet />
}
