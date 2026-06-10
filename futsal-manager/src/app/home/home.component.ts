// src/app/home/home.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CompetitionService } from './../competiton.service';
import { TeamService } from '../team.service';
import { RoundService } from '../round.service';
import { Competition } from '../model';

interface CompetitionCard extends Competition {
  teamCount: number;
  roundCount: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  cards: CompetitionCard[] = [];
  seasonText = '';

  constructor(
    private competitionService: CompetitionService,
    private teamService: TeamService,
    private roundService: RoundService
  ) {}

  async ngOnInit() {
    const competitions = await this.competitionService.getAll();

    this.cards = await Promise.all(
      competitions.map(async comp => {
        const [teams, rounds] = await Promise.all([
          this.teamService.getAllByCompetition(comp.id),
          this.roundService.getAllByCompetition(comp.id)
        ]);
        return { ...comp, teamCount: teams.length, roundCount: rounds.length };
      })
    );

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    this.seasonText = month >= 7 ? `${year}/${year + 1}` : `${year - 1}/${year}`;
  }
}
