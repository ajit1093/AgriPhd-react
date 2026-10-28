import { describe, it, expect } from 'vitest'
import { computeFinalCategory, CATEGORY } from '@/utils/categoryUtils'

/**
 * P4-02 — FinalCategoryID edge cases.
 * Logic ported from legacy C# GetFinalCategoryID() in CategoryAndOtherReservation.aspx.cs
 */
describe('computeFinalCategory', () => {

  // ── GENERAL always passes through ────────────────────────────────────────
  it('GENERAL category stays GENERAL regardless of certificates', () => {
    expect(computeFinalCategory(CATEGORY.GENERAL, 0, 0, 0, 0)).toBe(CATEGORY.GENERAL)
    expect(computeFinalCategory(CATEGORY.GENERAL, 1, 1, 1, 1)).toBe(CATEGORY.GENERAL)
  })

  // ── SC with certificate ───────────────────────────────────────────────────
  it('SC with caste certificate → stays SC', () => {
    expect(computeFinalCategory(CATEGORY.SC, 1, 0, 1, 1)).toBe(CATEGORY.SC)
  })

  // ── SC without certificate → downgrade ───────────────────────────────────
  it('SC without caste certificate → downgrade to GENERAL', () => {
    expect(computeFinalCategory(CATEGORY.SC, 0, 0, 1, 1)).toBe(CATEGORY.GENERAL)
  })

  // ── ST with/without certificate ───────────────────────────────────────────
  it('ST with caste certificate → stays ST', () => {
    expect(computeFinalCategory(CATEGORY.ST, 1, 0, 1, 1)).toBe(CATEGORY.ST)
  })
  it('ST without caste certificate → downgrade to GENERAL', () => {
    expect(computeFinalCategory(CATEGORY.ST, 0, 0, 1, 1)).toBe(CATEGORY.GENERAL)
  })

  // ── OBC without NCL → downgrade ──────────────────────────────────────────
  it('OBC with caste cert → stays OBC', () => {
    expect(computeFinalCategory(CATEGORY.OBC, 1, 0, 1, 1)).toBe(CATEGORY.OBC)
  })
  it('OBC without caste cert → downgrade to GENERAL', () => {
    expect(computeFinalCategory(CATEGORY.OBC, 0, 0, 1, 1)).toBe(CATEGORY.GENERAL)
  })

  // ── EWS with certificate ──────────────────────────────────────────────────
  it('EWS with EWS certificate → stays EWS', () => {
    expect(computeFinalCategory(CATEGORY.EWS, 0, 1, 0, 0)).toBe(CATEGORY.EWS)
  })

  // ── EWS without certificate ───────────────────────────────────────────────
  it('EWS without EWS certificate → downgrade to GENERAL', () => {
    expect(computeFinalCategory(CATEGORY.EWS, 0, 0, 0, 0)).toBe(CATEGORY.GENERAL)
  })

  // ── NT categories ─────────────────────────────────────────────────────────
  it.each([CATEGORY.NT_B, CATEGORY.NT_C, CATEGORY.NT_D])(
    'NT category %i with caste cert → stays NT', (cat) => {
      expect(computeFinalCategory(cat, 1, 0, 1, 1)).toBe(cat)
    }
  )
  it.each([CATEGORY.NT_B, CATEGORY.NT_C, CATEGORY.NT_D])(
    'NT category %i without caste cert → GENERAL', (cat) => {
      expect(computeFinalCategory(cat, 0, 0, 1, 1)).toBe(CATEGORY.GENERAL)
    }
  )

  // ── SBC, VJ_A, SEBC ──────────────────────────────────────────────────────
  it.each([CATEGORY.VJ_A, CATEGORY.SBC, CATEGORY.SEBC])(
    'category %i without caste cert → GENERAL', (cat) => {
      expect(computeFinalCategory(cat, 0, 0, 1, 1)).toBe(CATEGORY.GENERAL)
    }
  )

  // ── Caste validity rules ──────────────────────────────────────────────────
  it('SC with cert but no validity and no validity receipt → GENERAL', () => {
    expect(computeFinalCategory(CATEGORY.SC, 1, 0, 0, 0)).toBe(CATEGORY.GENERAL)
  })
  it('SC with cert, no validity but has validity receipt → stays SC', () => {
    expect(computeFinalCategory(CATEGORY.SC, 1, 0, 0, 1)).toBe(CATEGORY.SC)
  })
  it('SC with cert and has validity → stays SC', () => {
    expect(computeFinalCategory(CATEGORY.SC, 1, 0, 1, 0)).toBe(CATEGORY.SC)
  })
})
