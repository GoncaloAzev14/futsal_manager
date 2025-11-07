// src/app/home/home.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CompetitionService } from './../competiton.service';
import { Competition } from '../model';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  competitions: Competition[] = [];

  constructor(private competitionService: CompetitionService) {}

  async ngOnInit() {
    this.competitions = await this.competitionService.getAll();
  }
}