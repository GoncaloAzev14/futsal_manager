// src/app/model.ts
export interface Team {
  id: string;
  name: string;
  shortName?: string;
  createdAt: number;
}

export interface Round {
  id: string;
  name: string;
  order: number;
  createdAt: number;
}

export interface GoalEvent {
  id: string;
  matchId: string;
  teamId: string;
  playerName: string;
  minute?: number | null;
}

export interface Match {
  id: string;
  roundId: string;
  date?: string | null;
  location?: string;
  homeTeamId: string;
  awayTeamId: string;
  homeGoals?: number | null;
  awayGoals?: number | null;
  goalScorers?: GoalEvent[];
  notes?: string;
  createdAt: number;
}
