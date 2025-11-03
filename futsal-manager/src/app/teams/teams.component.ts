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
  logoFile: File | null = null;
  logoPreview: string | null = null;

  constructor(private teamService: TeamService) {}

  async ngOnInit() {
    await this.load();
  }

  async load() {
    this.teams = await this.teamService.getAll();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecione uma imagem');
        return;
      }

      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('A imagem é muito grande. Máximo 2MB');
        return;
      }

      this.logoFile = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.logoPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  clearLogo() {
    this.logoFile = null;
    this.logoPreview = null;
    const fileInput = document.getElementById('team-logo') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  async add() {
    if (!this.name.trim()) {
      alert('Por favor insira o nome da equipa');
      return;
    }

    await this.teamService.createTeam(this.name.trim(), undefined);

    // Reset form
    this.name = '';

    await this.load();
  }

  async remove(id: string) {
    if (!confirm('Remover equipa?')) return;
    await this.teamService.remove(id);
    await this.load();
  }
}
