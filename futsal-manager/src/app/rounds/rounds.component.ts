import { Component, OnInit } from '@angular/core';
import { RoundService } from '../round.service';
import { MatchService } from '../match.service';
import { TeamService } from '../team.service';
import { Round, Match, Team } from '../model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface RoundWithMatches {
  id: string;
  name: string;
  order: number;
  matches: Match[];
}

@Component({
  selector: 'app-rounds',
  templateUrl: './rounds.component.html',
  styleUrls: ['./rounds.component.scss'],
  imports: [CommonModule, FormsModule]
})
export class RoundsComponent implements OnInit {
  rounds: Round[] = [];
  roundsWithMatches: RoundWithMatches[] = [];
  teams: Team[] = [];
  name = '';

  constructor(
    private roundService: RoundService,
    private matchService: MatchService,
    private teamService: TeamService
  ) {}

  async ngOnInit() {
    await this.loadTeams();
    await this.load();
  }

  async loadTeams() {
    this.teams = await this.teamService.getAll();
  }

  async load() {
    this.rounds = await this.roundService.getAll();

    this.roundsWithMatches = await Promise.all(
      this.rounds.map(async (round) => {
        const matches = await this.matchService.getByRound(round.id);
        matches.sort((a, b) => {
          if (!a.date) return 1;
          if (!b.date) return -1;
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });

        return {
          id: round.id,
          name: round.name,
          order: round.order,
          matches
        };
      })
    );

    this.roundsWithMatches.sort((a, b) => b.order - a.order);
  }

  async add() {
    // Get the highest order number and add 1
    const maxOrder = this.rounds.length > 0
      ? Math.max(...this.rounds.map(r => r.order))
      : 0;
    const nextNumber = maxOrder + 1;
    const name = `Jornada ${nextNumber}`;

    await this.roundService.createRound(name, nextNumber);
    await this.load();
  }

  async remove(id: string) {
    const round = this.roundsWithMatches.find(r => r.id === id);

    if (round && round.matches.length > 0) {
      if (!confirm(`Esta jornada tem ${round.matches.length} jogo(s). Tem certeza que quer remover?`)) {
        return;
      }
    } else if (!confirm('Remover jornada?')) {
      return;
    }

    await this.roundService.remove(id);
    await this.load();
  }

  getTeamName(id?: string): string {
    if (!id) return 'Equipa';
    const team = this.teams.find(t => t.id === id);
    return team ? team.name : 'Equipa';
  }
}