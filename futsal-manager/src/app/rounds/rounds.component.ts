// src/app/rounds/rounds.component.ts
import { Component, OnInit } from '@angular/core';
import { RoundService } from '../round.service';
import { Round } from '../model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-rounds',
  templateUrl: './rounds.component.html',
  styleUrls: ['./rounds.component.scss'],
  imports: [CommonModule, FormsModule]
})
export class RoundsComponent implements OnInit {
  rounds: Round[] = [];
  name = '';

  constructor(private roundService: RoundService) {}

  async ngOnInit() { await this.load(); }
  async load() { this.rounds = await this.roundService.getAll(); }

  async add() {
    if (!this.name.trim()) return;
    await this.roundService.createRound(this.name.trim());
    this.name = '';
    await this.load();
  }

  async remove(id: string) {
    if (!confirm('Remover jornada?')) return;
    await this.roundService.remove(id);
    await this.load();
  }
}
