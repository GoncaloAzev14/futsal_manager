// src/app/competition.service.ts
import { Injectable } from '@angular/core';
import { AppDB } from '../db.service';
import { Competition } from '../model';
import { v4 as uuidv4 } from 'uuid';

@Injectable({ providedIn: 'root' })
export class CompetitionService {
  constructor(private db: AppDB) {
    this.initializeDefaultCompetitions();
  }

  private async initializeDefaultCompetitions() {
    const existing = await this.db.competitions.toArray();
    if (existing.length === 0) {
      // Create default competitions
      await this.createCompetition('Liga AFSA Veteranos', 'Veteranos', '🏅', 'league');
      await this.createCompetition('Liga AFSA Seniores', 'Seniores', '⚽', 'league');
    }
  }

  async createCompetition(
    name: string,
    shortName: string,
    icon: string,
    type: 'league' | 'cup'
  ): Promise<Competition> {
    const competition: Competition = {
      id: uuidv4(),
      name,
      shortName,
      icon,
      type,
      createdAt: Date.now()
    };
    await this.db.competitions.add(competition);
    return competition;
  }

  getAll() {
    return this.db.competitions.orderBy('createdAt').toArray();
  }

  getById(id: string) {
    return this.db.competitions.get(id);
  }

  update(competition: Competition) {
    return this.db.competitions.put(competition);
  }

  async remove(id: string) {
    // Optional: Add cascade delete for teams, rounds, matches
    await this.db.competitions.delete(id);
  }
}
