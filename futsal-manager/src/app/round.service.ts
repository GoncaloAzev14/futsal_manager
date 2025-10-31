// src/app/round.service.ts
import { Injectable } from '@angular/core';
import { AppDB } from './db.service';
import { Round } from './model';
import { v4 as uuidv4 } from 'uuid';

@Injectable({ providedIn: 'root' })
export class RoundService {
  constructor(private db: AppDB) {}

  async createRound(name: string, order?: number) {
    const last = await this.db.rounds.orderBy('order').last();
    const newOrder = order ?? ((last?.order ?? 0) + 1);
    const r: Round = { id: uuidv4(), name, order: newOrder, createdAt: Date.now() };
    await this.db.rounds.add(r);
    return r;
  }

  getAll() {
    return this.db.rounds.orderBy('order').toArray();
  }

  update(round: Round) {
    return this.db.rounds.put(round);
  }

  async remove(id: string) {
    // se quiseres: remover todos os jogos dessa jornada também
    // const matches = await this.db.matches.where('roundId').equals(id).toArray();
    // for (const m of matches) await this.db.matches.delete(m.id);
    return this.db.rounds.delete(id);
  }
}
