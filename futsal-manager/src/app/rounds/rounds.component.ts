// src/app/rounds/rounds.component.ts
import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RoundService } from '../round.service';
import { MatchService } from '../match.service';
import { TeamService } from '../team.service';
import { Round, Match, Team } from '../model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

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
  imports: [CommonModule, FormsModule, DragDropModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class RoundsComponent implements OnInit {
  rounds: Round[] = [];
  roundsWithMatches: RoundWithMatches[] = [];
  teams: Team[] = [];
  competitionId: string = '';
  collapsedRounds = new Set<string>();
  searchQuery = '';
  sortMode: 'recent' | 'old' | 'name' = 'recent';

  get filteredRounds(): RoundWithMatches[] {
    let result = [...this.roundsWithMatches];
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      result = result.filter(r => r.name.toLowerCase().includes(q));
    }
    switch (this.sortMode) {
      case 'recent': result.sort((a, b) => b.order - a.order); break;
      case 'old':    result.sort((a, b) => a.order - b.order); break;
      case 'name':   result.sort((a, b) => a.name.localeCompare(b.name, 'pt')); break;
    }
    return result;
  }

  get isDragDisabled(): boolean {
    return !!this.searchQuery.trim() || this.sortMode !== 'recent';
  }

  toggleCollapse(id: string): void {
    this.collapsedRounds.has(id) ? this.collapsedRounds.delete(id) : this.collapsedRounds.add(id);
  }

  isCollapsed(id: string): boolean {
    return this.collapsedRounds.has(id);
  }

  constructor(
    private roundService: RoundService,
    private matchService: MatchService,
    private teamService: TeamService,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    this.route.parent?.params.subscribe(async params => {
      this.competitionId = params['competitionId'];
      await this.loadTeams();
      await this.load();
    });
  }

  async loadTeams() {
    this.teams = await this.teamService.getAllByCompetition(this.competitionId);
  }

  async load() {
    this.rounds = await this.roundService.getAllByCompetition(this.competitionId);

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

    // sorting is handled by filteredRounds getter
  }

  async add() {
    const usedOrders = new Set(this.rounds.map(r => r.order));
    let nextOrder = 1;
    while (usedOrders.has(nextOrder)) nextOrder++;
    const name = `Jornada ${nextOrder}`;
    await this.roundService.createRound(name, this.competitionId, nextOrder);
    await this.load();
  }

  async onDrop(event: CdkDragDrop<RoundWithMatches[]>): Promise<void> {
    if (event.previousIndex === event.currentIndex) return;

    // Fixed slots in DESC order — round numbers never change
    const slots = [...this.rounds].sort((a, b) => b.order - a.order);

    // Compute the new assignment after the drag
    const newAssignment = [...this.roundsWithMatches];
    moveItemInArray(newAssignment, event.previousIndex, event.currentIndex);

    // Fetch all affected matches before any writes (avoids circular overwrite)
    const matchFetches = await Promise.all(
      slots.map((slot, i) =>
        newAssignment[i].id !== slot.id
          ? this.matchService.getByRound(newAssignment[i].id)
          : Promise.resolve([])
      )
    );

    // Reassign matches to their new rounds in parallel
    await Promise.all(
      slots.flatMap((slot, i) =>
        matchFetches[i].map(m => this.matchService.update({ ...m, roundId: slot.id }))
      )
    );

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

  trackByRound(_index: number, round: RoundWithMatches): string {
    return round.id;
  }

  private readonly avatarColors = [
    '#1e6e4a', '#0055aa', '#7b3fa6', '#b84231',
    '#3a6e1a', '#1a6e7a', '#8a6b1a', '#7a1a5a'
  ];

  getTeam(id?: string) {
    return id ? this.teams.find(t => t.id === id) : undefined;
  }

  getTeamName(id?: string): string {
    return this.getTeam(id)?.name ?? 'Equipa';
  }

  getTeamInitial(id?: string): string {
    const name = this.getTeam(id)?.name ?? '?';
    return name.charAt(0).toUpperCase();
  }

  getTeamColor(id?: string): string {
    const key = id ?? '';
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = key.charCodeAt(i) + ((hash << 5) - hash);
    }
    return this.avatarColors[Math.abs(hash) % this.avatarColors.length];
  }

  getRoundNumber(name: string): string {
    const match = name.match(/\d+/);
    return match ? match[0] : '?';
  }
}
