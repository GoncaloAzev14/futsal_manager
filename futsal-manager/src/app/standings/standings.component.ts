// src/app/standings/standings.component.ts
import { Component, OnInit } from '@angular/core';
import { StandingsService, StandingRow } from '../standings.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-standings',
  templateUrl: './standings.component.html',
  styleUrls: ['./standings.component.scss'],
  imports: [CommonModule]
})
export class StandingsComponent implements OnInit {
  rows: StandingRow[] = [];

  constructor(private standings: StandingsService) {}

  async ngOnInit() {
    this.rows = await this.standings.computeStandings();
  }
}
