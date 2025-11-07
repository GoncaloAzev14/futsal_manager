// src/app/standings/standings.component.ts
import { Component, OnInit } from '@angular/core';
import { StandingsService, StandingRow } from '../standings.service';
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
  competitionId: string = '';

  constructor(private standings: StandingsService,
    private route: ActivatedRoute) {}

  async ngOnInit() {
    this.route.parent?.params.subscribe(async params => {
      this.competitionId = params['competitionId'];
      this.rows = await this.standings.computeStandings(this.competitionId);
    });
  }
}
