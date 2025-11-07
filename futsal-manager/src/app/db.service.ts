// src/app/db.service.ts
import Dexie from 'dexie';
import { Injectable } from '@angular/core';
import { Team, Match, Round, GoalEvent, Competition } from './model';

@Injectable({ providedIn: 'root' })
export class AppDB extends Dexie {
  competitions!: Dexie.Table<Competition, string>;
  teams!: Dexie.Table<Team, string>;
  matches!: Dexie.Table<Match, string>;
  rounds!: Dexie.Table<Round, string>;
  goals!: Dexie.Table<GoalEvent, string>;

  constructor() {
    super('FutsalLeagueDB');
    this.version(2).stores({
      competitions: 'id, name, createdAt',
      teams: 'id, name, competitionId, createdAt',
      rounds: 'id, order, competitionId, createdAt',
      matches: 'id, roundId, competitionId, date, homeTeamId, awayTeamId, createdAt',
      goals: 'id, matchId, teamId'
    });

    this.competitions = this.table('competitions');
    this.teams = this.table('teams');
    this.matches = this.table('matches');
    this.rounds = this.table('rounds');
    this.goals = this.table('goals');
  }

  // Exporta todo o conteúdo para JSON (backup)
  async exportAll(): Promise<string> {
    const competitions = await this.competitions.toArray();
    const teams = await this.teams.toArray();
    const rounds = await this.rounds.toArray();
    const matches = await this.matches.toArray();
    const goals = await this.goals.toArray();
    return JSON.stringify({ competitions, teams, rounds, matches, goals });
  }

  // Importa (sobrescreve) a DB a partir de JSON (restore)
  async importAll(jsonString: string) {
    const obj = JSON.parse(jsonString);
    await this.transaction('rw', [this.competitions, this.teams, this.rounds, this.matches, this.goals], async () => {
      await this.competitions.clear();
      await this.teams.clear();
      await this.rounds.clear();
      await this.matches.clear();
      await this.goals.clear();

      if (obj.competitions) await this.competitions.bulkAdd(obj.competitions);
      if (obj.teams) await this.teams.bulkAdd(obj.teams);
      if (obj.rounds) await this.rounds.bulkAdd(obj.rounds);
      if (obj.matches) await this.matches.bulkAdd(obj.matches);
      if (obj.goals) await this.goals.bulkAdd(obj.goals);
    });
  }
}
