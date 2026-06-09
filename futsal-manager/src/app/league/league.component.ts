import { Component, OnInit } from '@angular/core'; import { RouterOutlet, RouterLink, RouterLinkActive, ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CompetitionService } from './../competiton.service';
import { Competition } from '../model';
import {
  LucideAngularModule,
  ChartColumn,
  CircleDot,
  CalendarDays,
  Users
} from 'lucide-angular';

@Component({
  selector: 'app-league',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './league.component.html',
  styleUrl: './league.component.scss'
})
export class LeagueComponent implements OnInit {
  readonly ChartColumn = ChartColumn;
  readonly CircleDot = CircleDot;
  readonly CalendarDays = CalendarDays;
  readonly Users = Users;
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
