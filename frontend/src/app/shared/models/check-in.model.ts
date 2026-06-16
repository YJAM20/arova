export interface RelationshipCheckIn {
  id: string;
  userId: string;
  dateKey: string;
  connectionLevel: number;
  energyLevel: number;
  communicationFeeling: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
}
