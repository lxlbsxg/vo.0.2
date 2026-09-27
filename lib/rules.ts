export const RULES_CONFIG = {
  infoValue: {
    headcountWeight: 0.5,
    medianFundingWeight: 0.5,
  },
  timeWeight: {
    startWeight: 1.0,
    minWeight: 0.2,
    slopePerMilestone: 0.15,
  },
  secondRoll: {
    cinnamonsFeePct: 0.2,
    firstRollPoolSharePct: 0.5,
  },
  maxAccountsPerPerson: 5,
  chapterMaxEdits: 3,
  announcementLeadTimeHours: 24,
};

export function calcInfoValue(headcount: number, medianFunding: number): number {
  const { headcountWeight, medianFundingWeight } = RULES_CONFIG.infoValue;
  return headcount * headcountWeight + medianFunding * medianFundingWeight;
}

export function calcTimeWeight(verifiedMilestonesSincePurchase: number): number {
  const { startWeight, minWeight, slopePerMilestone } = RULES_CONFIG.timeWeight;
  const weight = startWeight - verifiedMilestonesSincePurchase * slopePerMilestone;
  return Math.max(minWeight, weight);
}

export function calcMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}
