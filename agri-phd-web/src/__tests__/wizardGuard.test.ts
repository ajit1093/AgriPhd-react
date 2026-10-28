import { describe, it, expect } from 'vitest'

/**
 * P4-07 — Wizard step guard logic.
 * The wizard guard in the new project is implemented at the API level (SP returns
 * IsApplicationFormLocked) and the React router enforces role-based access.
 * This file tests the client-side step availability logic.
 */

// ── Step availability model ────────────────────────────────────────────────
// Ported from ApplicationFormSummaryPage.tsx / appFormApi step logic
type WizardStep = {
  id: string
  route: string
  requiresUnlocked: boolean  // true = step disabled when form is locked
  requiresPaid: boolean      // true = step only accessible after fee paid
}

const WIZARD_STEPS: WizardStep[] = [
  { id: 'personal',    route: '/candidate/application-form/personal',    requiresUnlocked: true,  requiresPaid: false },
  { id: 'address',     route: '/candidate/application-form/address',     requiresUnlocked: true,  requiresPaid: false },
  { id: 'category',    route: '/candidate/application-form/category',    requiresUnlocked: true,  requiresPaid: false },
  { id: 'qualification',route: '/candidate/application-form/qualification',requiresUnlocked: true,  requiresPaid: false },
  { id: 'research',    route: '/candidate/application-form/research-paper',requiresUnlocked: true,  requiresPaid: false },
  { id: 'shortlist',   route: '/candidate/application-form/shortlist',   requiresUnlocked: true,  requiresPaid: false },
  { id: 'photo-sign',  route: '/candidate/application-form/photo-sign',  requiresUnlocked: true,  requiresPaid: false },
  { id: 'documents',   route: '/candidate/application-form/documents',   requiresUnlocked: true,  requiresPaid: false },
  { id: 'pay-fee',     route: '/candidate/application-form/pay-fee',     requiresUnlocked: false, requiresPaid: false },
  { id: 'summary',     route: '/candidate/application-form/summary',     requiresUnlocked: false, requiresPaid: true  },
  { id: 'print',       route: '/candidate/application-form/print',       requiresUnlocked: false, requiresPaid: true  },
]

function getAvailableSteps(isLocked: boolean, isPaid: boolean): WizardStep[] {
  return WIZARD_STEPS.filter(step => {
    if (step.requiresUnlocked && isLocked) return false
    if (step.requiresPaid && !isPaid) return false
    return true
  })
}

describe('WizardRoute guard logic', () => {

  // ── Unlocked, unpaid ───────────────────────────────────────────────────────
  it('unlocked+unpaid: shows edit steps and pay-fee, hides summary/print', () => {
    const steps = getAvailableSteps(false, false)
    const ids = steps.map(s => s.id)
    expect(ids).toContain('personal')
    expect(ids).toContain('pay-fee')
    expect(ids).not.toContain('summary')
    expect(ids).not.toContain('print')
  })

  // ── Locked, unpaid ────────────────────────────────────────────────────────
  it('locked+unpaid: only pay-fee accessible (form submitted, fee not paid)', () => {
    const steps = getAvailableSteps(true, false)
    const ids = steps.map(s => s.id)
    expect(ids).toEqual(['pay-fee'])
  })

  // ── Locked, paid ──────────────────────────────────────────────────────────
  it('locked+paid: summary and print accessible, edit steps hidden', () => {
    const steps = getAvailableSteps(true, true)
    const ids = steps.map(s => s.id)
    expect(ids).toContain('summary')
    expect(ids).toContain('print')
    expect(ids).toContain('pay-fee')      // pay-fee is not locked (requiresUnlocked=false)
    expect(ids).not.toContain('personal') // edit steps are locked
  })

  // ── Unlocked, paid ────────────────────────────────────────────────────────
  it('unlocked+paid: all steps accessible (form unlocked after payment)', () => {
    const steps = getAvailableSteps(false, true)
    const ids = steps.map(s => s.id)
    expect(ids).toContain('personal')
    expect(ids).toContain('pay-fee')
    expect(ids).toContain('summary')
    expect(ids).toContain('print')
    expect(ids).toHaveLength(WIZARD_STEPS.length)
  })

  // ── Total step count ──────────────────────────────────────────────────────
  it('wizard has exactly 11 steps', () => {
    expect(WIZARD_STEPS).toHaveLength(11)
  })

  // ── All edit steps require unlock ─────────────────────────────────────────
  it('all edit steps (personal through documents) require unlocked form', () => {
    const editSteps = WIZARD_STEPS.filter(s => s.requiresUnlocked)
    const editIds = editSteps.map(s => s.id)
    expect(editIds).toContain('personal')
    expect(editIds).toContain('address')
    expect(editIds).toContain('photo-sign')
    expect(editIds).toContain('documents')
    expect(editIds).not.toContain('pay-fee')
  })
})
