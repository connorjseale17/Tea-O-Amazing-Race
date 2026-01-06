export interface StepEntry {
  amount: number;
  date: string; // ISO Date String
  week?: number; // Optional week association
}

export interface User {
  id: string;
  name: string;
  teamName?: string; 
  steps: number; // Total cumulative steps
  weeklySteps?: Record<string, number>; // Map of "1": 5000, "2": 10000
  stepHistory?: StepEntry[]; 
  iconId: string;
}

export interface Waypoint {
  name: string;
  lat: number;
  lng: number;
  fact: string;
  cumulativeDist?: number; 
}

export interface RaceState {
  users: User[];
  milestonesReached: string[];
}