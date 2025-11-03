import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-league',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './league.component.html',
  styleUrl: './league.component.scss'
})
export class LeagueComponent {
  constructor(private location: Location) {}

  goBack() {
    this.location.back();
  }
}
