export interface StepEntry {
  amount: number;
  date: string; // ISO Date String
}

export interface User {
  id: string;
  name: string;
  teamName?: string; 
  steps: number;
  stepHistory?: StepEntry[]; // New field for historical data
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