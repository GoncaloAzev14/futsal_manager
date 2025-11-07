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
  seasonText = '';

  constructor(private competitionService: CompetitionService) {}

  async ngOnInit() {
    this.competitions = await this.competitionService.getAll();

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0 = Janeiro, 7 = Agosto

    // Se estivermos entre Agosto e Dezembro → época é ano atual / ano seguinte
    // Se estivermos entre Janeiro e Julho → época é ano anterior / ano atual
    if (month >= 7) {
      this.seasonText = `${year}/${year + 1}`;
    } else {
      this.seasonText = `${year - 1}/${year}`;
    }
  }
}