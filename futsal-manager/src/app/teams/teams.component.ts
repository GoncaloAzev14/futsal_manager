// src/app/teams/teams.component.ts
import { Component, OnInit } from '@angular/core';
import { TeamService } from '../team.service';
import { Team } from '../model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-teams',
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.scss'],
  imports: [CommonModule, FormsModule]
})
export class TeamsComponent implements OnInit {
  teams: Team[] = [];
  name = '';

  constructor(private teamService: TeamService) {}

  async ngOnInit() {
    await this.load();
  }

  async load() {
    this.teams = await this.teamService.getAll();
  }

  async add() {
    if (!this.name.trim()) return;
    await this.teamService.createTeam(this.name.trim());
    this.name = '';
    await this.load();
  }

  async remove(id: string) {
    if (!confirm('Remover equipa?')) return;
    await this.teamService.remove(id);
    await this.load();
  }
}
