/**
 * Category IDs — matches legacy CategoryAndOtherReservationEntity.cs enum:
 * GENERAL=1, SC=2, ST=3, VJ_A=4, NT_B=5, NT_C=6, NT_D=7, OBC=8, SBC=9, SEBC=10, EWS=11
 */
export const CATEGORY = {
  GENERAL: 1,
  SC:      2,
  ST:      3,
  VJ_A:    4,
  NT_B:    5,
  NT_C:    6,
  NT_D:    7,
  OBC:     8,
  SBC:     9,
  SEBC:    10,
  EWS:     11,
} as const

/** Categories that require a valid caste certificate (and NCL for OBC/SBC/SEBC) */
export const CASTE_CERT_REQUIRED: number[] = [
  CATEGORY.SC,  CATEGORY.ST,  CATEGORY.VJ_A, CATEGORY.NT_B,
  CATEGORY.NT_C, CATEGORY.NT_D, CATEGORY.OBC,  CATEGORY.SBC, CATEGORY.SEBC,
]

/**
 * Computes the effective admission category (FinalCategoryID).
 * Ported from legacy C# GetFinalCategoryID() in CategoryAndOtherReservation.aspx.cs
 *
 * Rules:
 * 1. SC/ST/VJ/NT/OBC/SBC/SEBC without caste certificate → downgrade to GENERAL
 * 2. EWS without EWS certificate → downgrade to GENERAL
 * 3. SC/ST/VJ/NT/OBC/SBC/SEBC without caste validity AND without validity receipt → GENERAL
 * 4. Otherwise → keep original CategoryID
 *
 * @param categoryId - Selected category (1-11)
 * @param hasCasteCert - 1=yes, 0=no
 * @param hasEWS - 1=yes, 0=no
 * @param hasCasteValidity - 1=yes, 0=no
 * @param hasCasteValidityReceipt - 1=yes, 0=no
 */
export function computeFinalCategory(
  categoryId:              number,
  hasCasteCert:            number,
  hasEWS:                  number,
  hasCasteValidity:        number = 1,
  hasCasteValidityReceipt: number = 1,
): number {
  // Rule 1: caste certificate required
  if (CASTE_CERT_REQUIRED.includes(categoryId) && hasCasteCert !== 1) {
    return CATEGORY.GENERAL
  }
  // Rule 2: EWS certificate required
  if (categoryId === CATEGORY.EWS && hasEWS !== 1) {
    return CATEGORY.GENERAL
  }
  // Rule 3: caste validity required (no validity AND no receipt → GENERAL)
  if (
    CASTE_CERT_REQUIRED.includes(categoryId) &&
    hasCasteValidity !== 1 &&
    hasCasteValidityReceipt !== 1
  ) {
    return CATEGORY.GENERAL
  }
  return categoryId
}
