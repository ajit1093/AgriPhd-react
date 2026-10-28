import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { appFormApi } from '@/api/applicationForm'
import { CandidateInfoHeader } from '@/components/shared/CandidateInfoHeader'
import { WizardStepIndicator } from '@/components/ui/WizardStepIndicator'
import { CANDIDATE_ROUTES } from '@/router/routes'

interface WizardHeaderProps {
  currentStep: number // 1 to 10
}

const STEP_DEFINITIONS = [
  { number: 1,  label: 'Personal',        route: CANDIDATE_ROUTES.personal },
  { number: 2,  label: 'Address',         route: CANDIDATE_ROUTES.address },
  { number: 3,  label: 'Category',        route: CANDIDATE_ROUTES.category },
  { number: 4,  label: 'Qualification',   route: CANDIDATE_ROUTES.qualification },
  { number: 5,  label: 'Research Papers', route: CANDIDATE_ROUTES.researchPaper },
  { number: 6,  label: 'Colleges',        route: CANDIDATE_ROUTES.shortlist },
  { number: 7,  label: 'Photo & Sign',    route: CANDIDATE_ROUTES.uploadPhotoSign },
  { number: 8,  label: 'Documents',       route: CANDIDATE_ROUTES.uploadDocuments },
  { number: 9,  label: 'Pay Fee',         route: CANDIDATE_ROUTES.payFee },
  { number: 10, label: 'Summary & Lock',  route: CANDIDATE_ROUTES.formSummary },
]

/**
 * P6-THEME-13 — Modern Ph.D. Application Wizard Header.
 * Unifies Candidate Profile banner and 10-step progress indicator across all application steps.
 */
export function WizardHeader({ currentStep }: WizardHeaderProps) {
  const navigate = useNavigate()
  const { data } = useQuery({
    queryKey: ['application-form', 'summary'],
    queryFn: appFormApi.getSummary,
    staleTime: 30000,
  })

  const s = data?.status
  const p = data?.personal

  const completionMap: Record<number, boolean> = {
    1: s?.isPersonalDetailsFilled ?? false,
    2: s?.isAddressDetailsFilled ?? false,
    3: s?.isCategoryAndOtherReservationDetailsFilled ?? false,
    4: s?.isQualificationDetailsFilled ?? false,
    5: s?.isSportsDetailsFilled ?? false,
    6: s?.isAppliedForColleges ?? false,
    7: s?.isPhotoAndSignUploaded ?? false,
    8: s?.isAllCompulsoryDocumentsUploaded ?? false,
    9: s?.isApplicationFeePaid ?? false,
    10: s?.formStatus === 'Locked',
  }

  const steps = STEP_DEFINITIONS.map(def => {
    let status: 'complete' | 'active' | 'incomplete' = 'incomplete'
    if (def.number === currentStep) {
      status = 'active'
    } else if (completionMap[def.number] || def.number < currentStep) {
      status = 'complete'
    }
    return {
      number: def.number,
      label: def.label,
      status,
    }
  })

  const handleStepClick = (stepNumber: number) => {
    const target = STEP_DEFINITIONS.find(def => def.number === stepNumber)
    if (target) {
      navigate(target.route)
    }
  }

  return (
    <div className="mb-6 space-y-4">
      {p && (
        <CandidateInfoHeader
          applicationId={p.applicationFormNo || '—'}
          candidateName={p.candidateName || 'Candidate'}
          courseName="Doctor of Philosophy (Ph.D.)"
          photoUrl={p.photoUploadedURL}
        />
      )}
      <WizardStepIndicator steps={steps} onStepClick={handleStepClick} />
    </div>
  )
}
