// src/app/team.service.ts
import { Injectable } from '@angular/core';
import { AppDB } from './db.service';
import { Team } from './model';
import { v4 as uuidv4 } from 'uuid';

@Injectable({ providedIn: 'root' })
export class TeamService {
  constructor(private db: AppDB) {}

  async createTeam(name: string, shortName?: string, logo?: string) {
    const team: Team = {
      id: uuidv4(),
      name,
      shortName,
      logo,
      createdAt: Date.now()
    };
    await this.db.teams.add(team);
    return team;
  }

  getAll() {
    return this.db.teams.orderBy('name').toArray();
  }

  getById(id: string) {
    return this.db.teams.get(id);
  }

  update(team: Team) {
    return this.db.teams.put(team);
  }

  remove(id: string) {
    return this.db.teams.delete(id);
  }
}
