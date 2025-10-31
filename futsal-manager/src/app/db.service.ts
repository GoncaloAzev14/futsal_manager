// src/app/db.service.ts
import Dexie from 'dexie';
import { Injectable } from '@angular/core';
import { Team, Match, Round, GoalEvent } from './model';

@Injectable({ providedIn: 'root' })
export class AppDB extends Dexie {
  teams!: Dexie.Table<Team, string>;
  matches!: Dexie.Table<Match, string>;
  rounds!: Dexie.Table<Round, string>;
  goals!: Dexie.Table<GoalEvent, string>;

  constructor() {
    super('FutsalLeagueDB');
    this.version(1).stores({
      teams: 'id, name, createdAt',
      rounds: 'id, order, createdAt',
      matches: 'id, roundId, date, homeTeamId, awayTeamId, createdAt',
      goals: 'id, matchId, teamId'
    });

    this.teams = this.table('teams');
    this.matches = this.table('matches');
    this.rounds = this.table('rounds');
    this.goals = this.table('goals');
  }

  // Exporta todo o conteúdo para JSON (backup)
  async exportAll(): Promise<string> {
    const teams = await this.teams.toArray();
    const rounds = await this.rounds.toArray();
    const matches = await this.matches.toArray();
    const goals = await this.goals.toArray();
    return JSON.stringify({ teams, rounds, matches, goals });
  }

  // Importa (sobrescreve) a DB a partir de JSON (restore)
  async importAll(jsonString: string) {
    const obj = JSON.parse(jsonString);
    await this.transaction('rw', this.teams, this.rounds, this.matches, this.goals, async () => {
      await this.teams.clear();
      await this.rounds.clear();
      await this.matches.clear();
      await this.goals.clear();

      if (obj.teams) await this.teams.bulkAdd(obj.teams);
      if (obj.rounds) await this.rounds.bulkAdd(obj.rounds);
      if (obj.matches) await this.matches.bulkAdd(obj.matches);
      if (obj.goals) await this.goals.bulkAdd(obj.goals);
    });
  }
}
