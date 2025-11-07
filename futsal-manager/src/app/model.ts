// src/app/model.ts
export interface Competition {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  type: 'league' | 'cup';
  createdAt: number;
}

export interface Team {
  id: string;
  name: string;
  shortName?: string;
  competitionId: string;
  createdAt: number;
}

export interface Round {
  id: string;
  name: string;
  order: number;
  competitionId: string;
  createdAt: number;
}

export interface GoalEvent {
  id: string;
  matchId: string;
  teamId: string;
  competitionId: string;
  playerName: string;
  minute?: number | null;
}

export interface Match {
  id: string;
  roundId: string;
  competitionId: string;
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
