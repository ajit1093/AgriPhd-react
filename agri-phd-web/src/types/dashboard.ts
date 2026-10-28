export interface LoggedInUserDetails {
  userLoginID: string
  userType: string
  userName: string
  currentLoginDateTime: string
  lastLoginDateTime: string
  iPAddress: string
}

export interface RejectedDocumentRow {
  document: string
  comments: string
}

export interface CandidateDashboardData {
  userDetails: LoggedInUserDetails
  applicationFormStatus: string
  documentVerificationStatus: string
  isFormLocked: boolean
  isEligibleForFormFilling: boolean
  rejectedDocs: RejectedDocumentRow[]
}

export interface AdminDashboardData {
  userDetails: LoggedInUserDetails
  registered_1: string
  locked_1: string
  fullyVerified_1: string
  partiallyVerified_1: string
  noOfColleges_1: string
  intake_1: string
  admitted_1: string
  vacancy_1: string
}

export interface CollegeDashboardData {
  userDetails: LoggedInUserDetails
  intake: string
  admitted: string
  vacancy: string
}

export interface EVerificationDashboardData {
  userDetails: LoggedInUserDetails
  total: string
  fullyVerified: string
  partiallyVerified: string
  notAssigned: string
  notVerified: string
  reUploaded: string
  showNotAssigned: boolean
}
