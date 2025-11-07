// src/app/standings.service.ts
import { Injectable } from '@angular/core';
import { AppDB } from './db.service';
import { Team, Match } from './model';

export interface StandingRow {
  teamId: string;
  teamName: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

@Injectable({ providedIn: 'root' })
export class StandingsService {
  constructor(private db: AppDB) {}

  private pointsForResult(homeGoals: number, awayGoals: number) {
    if (homeGoals > awayGoals) return [3, 0];
    if (homeGoals < awayGoals) return [0, 3];
    return [1, 1];
  }

  async computeStandings(competitionId?: string): Promise<StandingRow[]> {
    // Filter teams by competitionId if provided
    let teams: Team[];
    if (competitionId) {
      teams = await this.db.teams.where('competitionId').equals(competitionId).toArray();
    } else {
      teams = await this.db.teams.toArray();
    }

    // Filter matches by roundId and/or competitionId
    let matches: Match[] = [];
    if (competitionId) {
      matches = await this.db.matches.where('competitionId').equals(competitionId).toArray();
    } else {
      matches = await this.db.matches.toArray();
    }

    const table = new Map<string, StandingRow>();
    teams.forEach(t => {
      table.set(t.id, {
        teamId: t.id,
        teamName: t.name,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0
      });
    });

    for (const m of matches) {
      if (m.homeGoals == null || m.awayGoals == null) continue;
      const home = table.get(m.homeTeamId)!;
      const away = table.get(m.awayTeamId)!;
      const hg = m.homeGoals!;
      const ag = m.awayGoals!;

      home.played += 1;
      away.played += 1;
      home.goalsFor += hg;
      home.goalsAgainst += ag;
      away.goalsFor += ag;
      away.goalsAgainst += hg;

      if (hg > ag) {
        home.wins += 1;
        away.losses += 1;
      } else if (hg < ag) {
        away.wins += 1;
        home.losses += 1;
      } else {
        home.draws += 1;
        away.draws += 1;
      }

      const [hp, ap] = this.pointsForResult(hg, ag);
      home.points += hp;
      away.points += ap;
    }

    const rows = Array.from(table.values()).map(r => {
      r.goalDifference = r.goalsFor - r.goalsAgainst;
      return r;
    });

    rows.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      return a.teamName.localeCompare(b.teamName);
    });

    return rows;
  }
}
