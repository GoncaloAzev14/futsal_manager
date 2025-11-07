// src/app/competition.service.ts
import { Injectable } from '@angular/core';
import { AppDB } from './db.service';
import { Competition } from './model';
import { v4 as uuidv4 } from 'uuid';

@Injectable({ providedIn: 'root' })
export class CompetitionService {
  private initialized = false;

  constructor(private db: AppDB) {}

  async initializeDefaultCompetitions() {
    if (this.initialized) return;

    const existing = await this.db.competitions.toArray();
    if (existing.length === 0) {
      // Create default competitions
      await this.createCompetition('Liga AFSA Veteranos', 'Veteranos', '🏅', 'league');
      await this.createCompetition('Liga AFSA Seniores', 'Seniores', '⚽', 'league');
    }

    this.initialized = true;
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

  async getAll(): Promise<Competition[]> {
    await this.initializeDefaultCompetitions();
    return this.db.competitions.orderBy('createdAt').toArray();
  }

  async getById(id: string): Promise<Competition | undefined> {
    await this.initializeDefaultCompetitions();
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