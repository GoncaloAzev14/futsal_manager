// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { TeamsComponent } from './teams/teams.component';
import { RoundsComponent } from './rounds/rounds.component';
import { MatchesComponent } from './matches/matches.component';
import { StandingsComponent } from './standings/standings.component';
import { LeagueComponent } from './league/league.component';

export const appRoutes: Routes = [
  { path: '', redirectTo: '', pathMatch: 'full' },
  {
    path: 'league',
    component: LeagueComponent,
    children: [
      { path: '', redirectTo: 'standings', pathMatch: 'full' },
      { path: 'teams', component: TeamsComponent },
      { path: 'rounds', component: RoundsComponent },
      { path: 'matches', component: MatchesComponent },
      { path: 'standings', component: StandingsComponent },
    ]
  },
  {
    path: 'cup',
    component: LeagueComponent,
    children: [
      { path: '', redirectTo: 'standings', pathMatch: 'full' },
      { path: 'teams', component: TeamsComponent },
      { path: 'rounds', component: RoundsComponent },
      { path: 'matches', component: MatchesComponent },
      { path: 'standings', component: StandingsComponent },
    ]
  }
];
