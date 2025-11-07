// src/app/match.service.ts
import { Injectable } from '@angular/core';
import { AppDB } from './db.service';
import { Match, GoalEvent } from './model';
import { v4 as uuidv4 } from 'uuid';

@Injectable({ providedIn: 'root' })
export class MatchService {
  constructor(private db: AppDB) {}

  async createMatch(competitionId: string, roundId: string, homeTeamId: string, awayTeamId: string, date?: string | null, location?: string) {
    const m: Match = {
      id: uuidv4(),
      roundId,
      homeTeamId,
      awayTeamId,
      competitionId,
      date: date ?? null,
      location,
      homeGoals: null,
      awayGoals: null,
      goalScorers: [],
      createdAt: Date.now()
    };
    await this.db.matches.add(m);
    return m;
  }

  getByRound(roundId: string) {
    return this.db.matches.where('roundId').equals(roundId).toArray();
  }

  getAll() {
    return this.db.matches.toArray();
  }

  update(match: Match) {
    return this.db.matches.put(match);
  }

  remove(id: string) {
    return this.db.matches.delete(id);
  }

  async addGoal(competitionId: string, matchId: string, teamId: string, playerName: string, minute?: number) {
    const g: GoalEvent = { id: uuidv4(), competitionId, matchId, teamId, playerName, minute: minute ?? null };
    await this.db.goals.add(g);

    const match = await this.db.matches.get(matchId);
    if (match) {
      match.goalScorers = match.goalScorers ?? [];
      match.goalScorers.push(g);
      await this.db.matches.put(match);
    }
    return g;
  }

  async getGoalsForMatch(matchId: string) {
    return this.db.goals.where('matchId').equals(matchId).toArray();
  }
}
