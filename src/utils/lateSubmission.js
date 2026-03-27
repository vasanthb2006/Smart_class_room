import { differenceInDays, differenceInHours } from 'date-fns'

/**
 * Calculate late submission penalty
 * @param {Date|string} dueDate
 * @param {Date|string} submittedAt
 * @param {number} maxMarks
 * @returns {{ isLate: boolean, lateDays: number, deductionPct: number, effectiveMaxMarks: number }}
 */
export function calculateLatePenalty(dueDate, submittedAt, maxMarks = 100) {
  const due = new Date(dueDate)
  const submitted = new Date(submittedAt)

  if (submitted <= due) {
    return {
      isLate: false,
      lateDays: 0,
      deductionPct: 0,
      effectiveMaxMarks: maxMarks,
    }
  }

  const msLate = submitted.getTime() - due.getTime()
  const daysLate = Math.ceil(msLate / (1000 * 60 * 60 * 24)) // any fraction of day counts as one day

  // 0.5 marks deduction per day late (capped at maxMarks)
  const deductionPoints = Math.min(daysLate * 0.5, maxMarks)
  const deductionPctDecimal = (deductionPoints / maxMarks) * 100
  const deductionPct = Math.round(deductionPctDecimal * 100) // multiply by 100 for integer storage (50 = 0.5%)
  const effectiveMaxMarks = Math.max(Number((maxMarks - deductionPoints).toFixed(2)), 0)

  return {
    isLate: true,
    lateDays: daysLate,
    deductionPoints,
    deductionPct,
    deductionPctDecimal,
    effectiveMaxMarks,
  }
}

/**
 * Apply late penalty to awarded marks
 * @param {number} rawMarks — marks before deduction
 * @param {number} deductionPoints — points to deduct
 * @returns {number}
 */
export function applyPenaltyToMarks(rawMarks, deductionPoints) {
  if (!deductionPoints || deductionPoints <= 0) return rawMarks
  return Math.max(0, Number((rawMarks - deductionPoints).toFixed(2)))
}

/**
 * Human-readable penalty description
 */
export function penaltyDescription(deductionPoints, lateDays) {
  if (!deductionPoints) return null
  return `${lateDays} day${lateDays !== 1 ? 's' : ''} late — ${deductionPoints} pts deducted`
}
