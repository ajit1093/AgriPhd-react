export interface CollegeSearchResult {
  collegeCode: string
  district: string
  collegeName: string
  course: string
  courseStatus: string
  intake: string
}

export interface AgriCollegeSearchResult {
  collegeCode: string
  district: string
  collegeName: string
  collegeAddress: string
  phdFacultyName: string
  collegeStatus: string
  subjectName: string
}

export interface AllotmentListItem {
  applicationID: string
  applicationFormNo: string
  candidateName: string
  studentCategoryDisplay: string
  allottedCategoryDisplay: string
  roasterSeqNo: string
  roasterPoint: string
}

export interface UniversityVacancyResponse {
  collegeWise: CollegeVacancyRow[]
  subjectWise: SubjectVacancyRow[]
  rosterDetails: RosterVacancyRow[]
}

export interface CollegeVacancyRow {
  subjectName: string; quota: string; category: string
  genderType: string; allottedType: string; vac: string
}
export interface SubjectVacancyRow {
  collegeCode: string; collegeName: string; pHDCollegeCode: string
  subjectName: string; quota: string; vac: string
}
export interface RosterVacancyRow {
  rosterSrNo: string; rosterPoints: string; categoryName: string; vac: string
}
