export function getScoreDelta(eventType: string): number {
  const map: Record<string, number> = {
    PAID_EARLY: 5, PAID_ONTIME: 2,
    LATE_1_3: -5, LATE_4_7: -10,
    LATE_7_PLUS: -20, NO_RESPONSE: -30,
    PARTIAL: -5,
  };
  return map[eventType] ?? 0;
}

export function getScoreCategory(score: number): 'Good' | 'Average' | 'Risky' {
  if (score >= 85) return 'Good';
  if (score >= 60) return 'Average';
  return 'Risky';
}
