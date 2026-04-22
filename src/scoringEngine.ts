export function getScoreDelta(eventType: string): number {
  const map: Record<string, number> = {
    PAID_EARLY: 5,
    PAID_ONTIME: 3,
    PAID_LATE_1_3: 2,
    PAID_LATE_4_7: -1,
    PAID_LATE_7_PLUS: -3,
    LATE_1_3: -1,
    LATE_4_7: -1,
    LATE_7_PLUS: -3,
    NO_RESPONSE: -30,
    PARTIAL: -5,
  };
  return map[eventType] ?? 0;
}

export function getScoreCategory(score: number): 'Good' | 'Average' | 'Risky' {
  if (score >= 85) return 'Good';
  if (score >= 60) return 'Average';
  return 'Risky';
}
