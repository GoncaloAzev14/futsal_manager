// src/app/settings/settings.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompetitionService } from '../competiton.service';
import { MigrationService } from '../migration.service';
import { AppDB } from '../db.service';
import { Competition } from '../model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  competitions: Competition[] = [];

  newCompName = '';
  newCompShort = '';
  newCompIcon = '';
  newCompType: 'league' | 'cup' = 'league';

  constructor(
    private router: Router,
    private competitionService: CompetitionService,
    private migrationService: MigrationService,
    private db: AppDB
  ) {}

  get isCompetitionFormValid(): boolean {
    return !!(this.newCompName && this.newCompShort && this.newCompType);
  }

  async ngOnInit() {
    await this.loadCompetitions();
  }

  async loadCompetitions() {
    this.competitions = await this.competitionService.getAll();
  }

  async addCompetition() {
    if (!this.newCompName.trim()) {
      alert('Por favor insira um nome');
      return;
    }

    await this.competitionService.createCompetition(
      this.newCompName,
      this.newCompShort || this.newCompName,
      this.newCompIcon || '🏆',
      this.newCompType
    );

    this.newCompName = '';
    this.newCompShort = '';
    this.newCompIcon = '';
    this.newCompType = 'league';

    await this.loadCompetitions();
  }

  async deleteCompetition(id: string) {
    const comp = this.competitions.find(c => c.id === id);
    if (!confirm(`Eliminar "${comp?.name}"? Isto vai apagar todas as equipas, jogos e dados desta competição.`)) {
      return;
    }

    // Delete all related data
    await this.db.transaction('rw',
      [this.db.teams,
      this.db.rounds,
      this.db.matches,
      this.db.goals,
      this.db.competitions],
      async () => {
        // Delete teams
        const teams = await this.db.teams.where('competitionId').equals(id).toArray();
        for (const team of teams) {
          await this.db.teams.delete(team.id);
        }

        // Delete rounds and their matches
        const rounds = await this.db.rounds.where('competitionId').equals(id).toArray();
        for (const round of rounds) {
          const matches = await this.db.matches.where('roundId').equals(round.id).toArray();
          for (const match of matches) {
            await this.db.matches.delete(match.id);
          }
          await this.db.rounds.delete(round.id);
        }

        // Delete competition
        await this.db.competitions.delete(id);
      }
    );

    await this.loadCompetitions();
  }

  async exportData() {
    const json = await this.db.exportAll();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `futsal-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  importData() {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fileInput?.click();
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const json = e.target?.result as string;
        await this.db.importAll(json);
        alert('Dados importados com sucesso!');
        window.location.reload();
      } catch (error) {
        alert('Erro ao importar dados: ' + error);
      }
    };

    reader.readAsText(file);
  }

  async resetAll() {
    await this.migrationService.resetDatabase();
  }

  goBack() {
    this.router.navigate(['/']);
  }
}