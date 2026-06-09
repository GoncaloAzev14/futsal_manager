// src/app/teams/teams.component.ts
import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TeamService } from '../team.service';
import { Team } from '../model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-teams',
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.scss'],
  imports: [CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class TeamsComponent implements OnInit {
  teams: Team[] = [];
  name = '';
  competitionId: string = '';
  pendingLogo: string | null = null;

  private readonly avatarColors = [
    '#1e6e4a', '#0055aa', '#7b3fa6', '#b84231',
    '#3a6e1a', '#1a6e7a', '#8a6b1a', '#7a1a5a'
  ];

  constructor(
    private teamService: TeamService,
    private route: ActivatedRoute
  ) {}

  get isTeamFormValid(): boolean {
    return this.name.trim().length > 0;
  }

  async ngOnInit() {
    this.route.parent?.params.subscribe(async params => {
      this.competitionId = params['competitionId'];
      await this.load();
    });
  }

  async load() {
    this.teams = await this.teamService.getAllByCompetition(this.competitionId);
  }

  async add() {
    if (!this.name.trim()) return;
    await this.teamService.createTeam(
      this.name.trim(),
      this.competitionId,
      undefined,
      this.pendingLogo ?? undefined
    );
    this.name = '';
    this.pendingLogo = null;
    await this.load();
  }

  async remove(id: string) {
    if (!confirm('Remover equipa?')) return;
    await this.teamService.remove(id);
    await this.load();
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.resizeImage(file, 240).then(dataUrl => {
      this.pendingLogo = dataUrl;
    });
    input.value = '';
  }

  private resizeImage(file: File, maxSize: number): Promise<string> {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = e => {
        const img = new Image();
        img.onload = () => {
          let w = img.width, h = img.height;
          if (w > h) { if (w > maxSize) { h = Math.round((h * maxSize) / w); w = maxSize; } }
          else       { if (h > maxSize) { w = Math.round((w * maxSize) / h); h = maxSize; } }
          const canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        };
        img.src = e.target!.result as string;
      };
      reader.readAsDataURL(file);
    });
  }

  getTeamInitial(name: string): string {
    return name.trim().charAt(0).toUpperCase();
  }

  getTeamColor(key: string): string {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = key.charCodeAt(i) + ((hash << 5) - hash);
    }
    return this.avatarColors[Math.abs(hash) % this.avatarColors.length];
  }
}
