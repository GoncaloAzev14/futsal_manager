import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-league',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './league.component.html',
  styleUrl: './league.component.scss'
})
export class LeagueComponent {
  constructor(private router: Router) {}

  goBack() {
    this.router.navigate(['/']);
  }
}
