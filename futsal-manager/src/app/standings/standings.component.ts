// src/app/standings/standings.component.ts
import { Component, OnInit } from '@angular/core';
import { StandingsService, StandingRow } from '../standings.service';
import { TeamService } from '../team.service';
import { Team } from '../model';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-standings',
  templateUrl: './standings.component.html',
  styleUrls: ['./standings.component.scss'],
  imports: [CommonModule]
})
export class StandingsComponent implements OnInit {
  rows: StandingRow[] = [];
  teams: Team[] = [];
  competitionId: string = '';

  private readonly avatarColors = [
    '#1e6e4a', '#0055aa', '#7b3fa6', '#b84231',
    '#3a6e1a', '#1a6e7a', '#8a6b1a', '#7a1a5a'
  ];

  constructor(
    private standings: StandingsService,
    private teamService: TeamService,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    this.route.parent?.params.subscribe(async params => {
      this.competitionId = params['competitionId'];
      [this.rows, this.teams] = await Promise.all([
        this.standings.computeStandings(this.competitionId),
        this.teamService.getAllByCompetition(this.competitionId)
      ]);
    });
  }

  getTeam(id: string): Team | undefined {
    return this.teams.find(t => t.id === id);
  }

  getTeamColor(id: string): string {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return this.avatarColors[Math.abs(hash) % this.avatarColors.length];
  }

  diffLabel(n: number): string {
    if (n > 0) return `+${n}`;
    return `${n}`;
  }
}
