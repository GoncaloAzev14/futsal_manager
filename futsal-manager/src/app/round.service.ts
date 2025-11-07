// src/app/round.service.ts
import { Injectable } from '@angular/core';
import { AppDB } from './db.service';
import { Round } from './model';
import { v4 as uuidv4 } from 'uuid';

@Injectable({ providedIn: 'root' })
export class RoundService {
  constructor(private db: AppDB) {}

  async createRound(name: string, competitionId: string, order?: number) {
    // Get last round order for this competition
    const last = await this.db.rounds
      .where('competitionId')
      .equals(competitionId)
      .reverse()
      .sortBy('order');

    const lastRound = last[0];
    const newOrder = order ?? ((lastRound?.order ?? 0) + 1);

    const r: Round = {
      id: uuidv4(),
      name,
      competitionId,
      order: newOrder,
      createdAt: Date.now()
    };
    await this.db.rounds.add(r);
    return r;
  }

  async getAllByCompetition(competitionId: string): Promise<Round[]> {
    const rounds = await this.db.rounds
      .where('competitionId')
      .equals(competitionId)
      .toArray();

    return rounds.sort((a, b) => a.order - b.order);
  }

  update(round: Round) {
    return this.db.rounds.put(round);
  }

  async remove(id: string) {
    // Optional: Remove all matches from this round
    const matches = await this.db.matches.where('roundId').equals(id).toArray();
    for (const m of matches) {
      await this.db.matches.delete(m.id);
    }
    return this.db.rounds.delete(id);
  }

  getAll(): Promise<Round[]> {
    return this.db.rounds.toArray();
  }
}