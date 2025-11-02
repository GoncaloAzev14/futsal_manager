// src/app/matches/matches.component.ts
import { Component, OnInit } from '@angular/core';
import { TeamService } from '../team.service';
import { MatchService } from '../match.service';
import { RoundService } from '../round.service';
import { Team, Round, Match } from '../model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface MatchesByDay {
  date: string;
  displayDate: string;
  matches: Match[];
}

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

  matchesByDay: MatchesByDay[] = [];

  constructor(
    private teamService: TeamService,
    private roundService: RoundService,
    private matchService: MatchService
  ) {}

  async ngOnInit() {
    this.teams = await this.teamService.getAll();
    this.rounds = await this.roundService.getAll();
    await this.loadMatches();
  }

  async loadMatches() {
    const allMatches = await this.matchService.getAll();

    // Group matches by date
    const matchMap = new Map<string, Match[]>();

    for (const match of allMatches) {
      const dateKey = match.date
        ? new Date(match.date).toISOString().split('T')[0]
        : 'no-date';

      if (!matchMap.has(dateKey)) {
        matchMap.set(dateKey, []);
      }
      matchMap.get(dateKey)!.push(match);
    }

    // Convert to array and sort
    this.matchesByDay = Array.from(matchMap.entries())
      .map(([date, matches]) => {
        matches.sort((a, b) => {
          if (!a.date || !b.date) return 0;
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });

        return {
          date,
          displayDate: date === 'no-date' ? 'Sem data' : this.formatDate(date),
          matches
        };
      })
      .sort((a, b) => {
        if (a.date === 'no-date') return 1;
        if (b.date === 'no-date') return -1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) return 'Hoje';
    if (isTomorrow) return 'Amanhã';
    if (isYesterday) return 'Ontem';

    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return date.toLocaleDateString('pt-PT', options);
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
    await this.matchService.createMatch(
      this.selectedRoundId,
      this.homeTeamId,
      this.awayTeamId,
      this.date ?? null,
      this.location
    );

    // Reset form
    this.selectedRoundId = undefined;
    this.homeTeamId = undefined;
    this.awayTeamId = undefined;
    this.date = undefined;
    this.location = undefined;

    await this.loadMatches();
  }

  async updateResult(m: Match) {
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
    if (!id) return 'Equipa';
    const team = this.teams.find(t => t.id === id);
    return team ? team.name : 'Equipa';
  }

  getRoundName(roundId?: string): string {
    if (!roundId) return '';
    const round = this.rounds.find(r => r.id === roundId);
    return round ? round.name : '';
  }
}