export interface FirstWeekChecklistItem {
  id: string;
  titleKey: string;     // Translation key for title
  descKey: string;      // Translation key for description
  route: string;
  ctaLabel: string;
  completed: boolean;
  optional?: boolean;
}

export interface ChecklistState {
  dismissed: boolean;
  snoozedUntil: string | null;
  planetVisited: boolean;
}
