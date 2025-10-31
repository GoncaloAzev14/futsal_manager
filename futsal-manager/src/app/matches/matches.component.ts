// src/app/matches/matches.component.ts
import { Component, OnInit } from '@angular/core';
import { TeamService } from '../team.service';
import { MatchService } from '../match.service';
import { RoundService } from '../round.service';
import { Team, Round, Match } from '../model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-matches',
  templateUrl: './matches.component.html',
  styleUrls: ['./matches.component.scss'],
  imports: [CommonModule, FormsModule]
})
export class MatchesComponent implements OnInit {
  teams: Team[] = [];
  rounds: Round[] = [];
  selectedRoundId?: string;

  homeTeamId?: string;
  awayTeamId?: string;
  date?: string;
  location?: string;

  matches: Match[] = [];

  constructor(
    private teamService: TeamService,
    private roundService: RoundService,
    private matchService: MatchService
  ) {}

  async ngOnInit() {
    this.teams = await this.teamService.getAll();
    this.rounds = await this.roundService.getAll();
  }

  async loadMatches() {
    if (!this.selectedRoundId) { this.matches = []; return; }
    this.matches = await this.matchService.getByRound(this.selectedRoundId);
  }

  async createMatch() {
    if (!this.selectedRoundId || !this.homeTeamId || !this.awayTeamId) {
      alert('Seleciona jornada e ambas equipas');
      return;
    }
    if (this.homeTeamId === this.awayTeamId) {
      alert('Uma equipa não pode jogar contra ela própria');
      return;
    }
    await this.matchService.createMatch(this.selectedRoundId, this.homeTeamId, this.awayTeamId, this.date ?? null, this.location);
    await this.loadMatches();
  }

  async updateResult(m: Match) {
    // Garante que números são null ou number
    if (!m.homeGoals && m.homeGoals !== 0) m.homeGoals = null;
    if (!m.awayGoals && m.awayGoals !== 0) m.awayGoals = null;
    await this.matchService.update(m);
    await this.loadMatches();
  }

  async removeMatch(id: string) {
    if (!confirm('Remover jogo?')) return;
    await this.matchService.remove(id);
    await this.loadMatches();
  }

  getTeamName(id?: string): string {
    if (!id) return '';
    const team = this.teams.find(t => t.id === id);
    return team ? team.name : '';
  }

}
