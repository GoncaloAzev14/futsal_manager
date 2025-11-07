import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CompetitionService } from './../competiton.service';
import { Competition } from '../model';

@Component({
  selector: 'app-league',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './league.component.html',
  styleUrl: './league.component.scss'
})
export class LeagueComponent implements OnInit {
  competitionId: string = '';
  competition: Competition | undefined;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private competitionService: CompetitionService
  ) {}

  async ngOnInit() {
    this.route.params.subscribe(async params => {
      this.competitionId = params['competitionId'];
      this.competition = await this.competitionService.getById(this.competitionId);
    });
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
