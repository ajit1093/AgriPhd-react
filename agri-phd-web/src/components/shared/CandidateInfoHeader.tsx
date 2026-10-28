interface CandidateInfoHeaderProps {
  applicationId: string
  candidateName: string
  courseName?: string
  photoUrl?: string
}

/**
 * P1-UI-12 / P6-THEME-13 — Modern CandidateInfoHeader strip.
 * Read-only strip showing candidate's application ID, name, and course.
 */
export function CandidateInfoHeader({ applicationId, candidateName, courseName, photoUrl }: CandidateInfoHeaderProps) {
  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-3 sm:p-4 mb-5 shadow-2xs flex items-center justify-between gap-4">
      <div className="flex items-center gap-3.5">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={`Photo of ${candidateName}`}
            className="h-12 w-12 sm:h-14 sm:w-14 rounded-full object-cover border-2 border-primary-200 shadow-2xs shrink-0"
          />
        ) : (
          <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-primary-100 border-2 border-primary-200 flex items-center justify-center text-primary-800 text-lg font-bold shrink-0">
            {candidateName ? candidateName.charAt(0).toUpperCase() : '👤'}
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-2xs uppercase tracking-wider font-bold bg-primary-50 text-primary-900 border border-primary-200 px-2 py-0.5 rounded">
              Ph.D. Applicant
            </span>
            <span className="text-xs font-mono font-bold text-neutral-600">
              ID: {applicationId}
            </span>
          </div>
          <h2 className="text-sm sm:text-base font-bold text-neutral-900 truncate mt-0.5">
            {candidateName}
          </h2>
          {courseName && (
            <p className="text-2xs sm:text-xs text-neutral-500 truncate mt-0.5">
              {courseName}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
