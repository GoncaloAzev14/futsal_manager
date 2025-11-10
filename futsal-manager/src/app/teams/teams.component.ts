// src/app/teams/teams.component.ts
import { Component, OnInit } from '@angular/core';
import { TeamService } from '../team.service';
import { Team } from '../model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-teams',
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.scss'],
  imports: [CommonModule, FormsModule]
})
export class TeamsComponent implements OnInit {
  teams: Team[] = [];
  name = '';
  competitionId: string = '';

  constructor(
    private teamService: TeamService,
    private route: ActivatedRoute
  ) {}

  get isTeamFormValid(): boolean {
    return this.name.trim().length > 0;
  }

  async ngOnInit() {
    // Get competitionId from parent route
    this.route.parent?.params.subscribe(async params => {
      this.competitionId = params['competitionId'];
      await this.load();
    });
  }

  async load() {
    this.teams = await this.teamService.getAllByCompetition(this.competitionId);
  }

  async add() {
    if (!this.name.trim()) {
      alert('Por favor insira o nome da equipa');
      return;
    }

    await this.teamService.createTeam(this.name.trim(), this.competitionId);
    this.name = '';
    await this.load();
  }

  async remove(id: string) {
    if (!confirm('Remover equipa?')) return;
    await this.teamService.remove(id);
    await this.load();
  }
}