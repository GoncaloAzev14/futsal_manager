// src/app/settings/settings.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CompetitionService } from '../competiton.service';
import { MigrationService } from '../migration.service';
import { AppDB } from '../db.service';
import { Competition } from '../model';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container fade-in">
      <h2>⚙️ Configurações</h2>

      <!-- Manage Competitions -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">Gerir Competições</div>
        </div>

        <div class="competitions-list">
          <div *ngFor="let comp of competitions" class="competition-item">
            <div class="comp-info">
              <span class="comp-icon">{{ comp.icon }}</span>
              <div>
                <div class="comp-name">{{ comp.name }}</div>
                <div class="comp-type">{{ comp.type === 'league' ? 'Liga' : 'Taça' }}</div>
              </div>
            </div>
            <button class="btn-danger btn-small" (click)="deleteCompetition(comp.id)">
              Eliminar
            </button>
          </div>
        </div>

        <details class="add-competition-form">
          <summary>Adicionar Nova Competição</summary>
          <div class="form-content">
            <div class="form-field">
              <label>Nome</label>
              <input type="text" [(ngModel)]="newCompName" placeholder="Liga AFSA Sub-20">
            </div>
            <div class="form-field">
              <label>Nome Curto</label>
              <input type="text" [(ngModel)]="newCompShort" placeholder="Sub-20">
            </div>
            <div class="form-field">
              <label>Ícone (emoji)</label>
              <input type="text" [(ngModel)]="newCompIcon" placeholder="🏆" maxlength="2">
            </div>
            <div class="form-field">
              <label>Tipo</label>
              <select [(ngModel)]="newCompType">
                <option value="league">Liga</option>
                <option value="cup">Taça</option>
              </select>
            </div>
            <button class="btn-primary" (click)="addCompetition()">Criar Competição</button>
          </div>
        </details>
      </div>

      <!-- Data Management -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">Gestão de Dados</div>
        </div>

        <div class="data-actions">
          <button class="btn-secondary" (click)="exportData()">
            📥 Exportar Dados
          </button>
          <button class="btn-secondary" (click)="importData()">
            📤 Importar Dados
          </button>
          <button class="btn-danger" (click)="resetAll()">
            🗑️ Apagar Tudo
          </button>
        </div>

        <input
          type="file"
          #fileInput
          accept=".json"
          style="display: none"
          (change)="onFileSelected($event)"
        >
      </div>

      <!-- Back Button -->
      <div class="card">
        <a routerLink="/" class="btn-primary" style="text-decoration: none; display: inline-block;">
          ← Voltar ao Início
        </a>
      </div>
    </div>
  `,
  styles: [`
    .competitions-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 20px;
    }

    .competition-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
      background: var(--bg-primary);
      border-radius: 8px;
      border: 2px solid var(--border-color);
    }

    .comp-info {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .comp-icon {
      font-size: 2rem;
    }

    .comp-name {
      font-weight: 600;
      font-size: 1.1rem;
    }

    .comp-type {
      font-size: 0.85rem;
      color: var(--text-secondary);
    }

    .add-competition-form {
      margin-top: 20px;
      border: 2px solid var(--border-color);
      border-radius: 8px;
      padding: 15px;
    }

    .add-competition-form summary {
      cursor: pointer;
      font-weight: 600;
      user-select: none;
    }

    .form-content {
      margin-top: 15px;
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .data-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    @media (max-width: 768px) {
      .data-actions {
        flex-direction: column;
      }

      .data-actions button {
        width: 100%;
      }
    }
  `]
})
export class SettingsComponent implements OnInit {
  competitions: Competition[] = [];

  newCompName = '';
  newCompShort = '';
  newCompIcon = '';
  newCompType: 'league' | 'cup' = 'league';

  constructor(
    private competitionService: CompetitionService,
    private migrationService: MigrationService,
    private db: AppDB
  ) {}

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
}