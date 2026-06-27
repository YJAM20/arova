import { calculateStreak, groupActivityByDate } from './relationship-activity.service';

describe('RelationshipActivity Helpers', () => {
  describe('calculateStreak', () => {
    const today = new Date('2026-06-22T12:00:00Z');

    it('returns 0 for empty dates list', () => {
      expect(calculateStreak([])).toBe(0);
      expect(calculateStreak([], today)).toBe(0);
    });

    it('returns 0 if most recent date is before yesterday', () => {
      const dates = ['2026-06-19', '2026-06-18'];
      expect(calculateStreak(dates, today)).toBe(0);
    });

    it('calculates streak correctly when active today', () => {
      const dates = ['2026-06-22', '2026-06-21', '2026-06-20', '2026-06-18'];
      expect(calculateStreak(dates, today)).toBe(3);
    });

    it('calculates streak correctly when active yesterday but not today', () => {
      const dates = ['2026-06-21', '2026-06-20', '2026-06-19'];
      expect(calculateStreak(dates, today)).toBe(3);
    });

    it('handles duplicate dates and unsorted lists correctly', () => {
      const dates = ['2026-06-20', '2026-06-22', '2026-06-21', '2026-06-21'];
      expect(calculateStreak(dates, today)).toBe(3);
    });
  });

  describe('groupActivityByDate', () => {
    it('groups ledger entries and local features correctly without double-counting', () => {
      const ledger = [
        { timestamp: '2026-06-22T08:00:00Z', points: 10, action: 'check_in' },
        { timestamp: '2026-06-22T09:00:00Z', points: 15, action: 'daily_question' },
        { timestamp: '2026-06-21T10:00:00Z', points: 20, action: 'memory' }
      ];

      const localFeatures = [
        // On 2026-06-22, we already have ledger entries, so these should be ignored
        { date: '2026-06-22', type: 'Memory' },
        // On 2026-06-20, we have NO ledger entries, so this should be counted
        { date: '2026-06-20', type: 'Letter' }
      ];

      const result = groupActivityByDate(ledger, localFeatures);

      expect(result.length).toBe(3); // 2026-06-20, 2026-06-21, 2026-06-22

      // Check 2026-06-20 (local feature only)
      const day20 = result.find(d => d.date === '2026-06-20');
      expect(day20).toBeDefined();
      expect(day20!.count).toBe(1);
      expect(day20!.points).toBe(0);
      expect(day20!.types).toContain('Letter');

      // Check 2026-06-21 (ledger only)
      const day21 = result.find(d => d.date === '2026-06-21');
      expect(day21).toBeDefined();
      expect(day21!.count).toBe(1);
      expect(day21!.points).toBe(20);
      expect(day21!.types).toContain('memory');

      // Check 2026-06-22 (ledger combined, ignoring local features)
      const day22 = result.find(d => d.date === '2026-06-22');
      expect(day22).toBeDefined();
      expect(day22!.count).toBe(2);
      expect(day22!.points).toBe(25);
      expect(day22!.types).toContain('check_in');
      expect(day22!.types).toContain('daily_question');
      expect(day22!.types).not.toContain('Memory');
    });
  });
});
