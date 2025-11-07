// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { TeamsComponent } from './teams/teams.component';
import { RoundsComponent } from './rounds/rounds.component';
import { MatchesComponent } from './matches/matches.component';
import { StandingsComponent } from './standings/standings.component';
import { LeagueComponent } from './league/league.component';
import { HomeComponent } from './home/home.component';
import { SettingsComponent } from './settings/settings.component';

export const appRoutes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'settings', component: SettingsComponent },
  {
    path: 'competition/:competitionId',
    component: LeagueComponent,
    children: [
      { path: '', redirectTo: 'standings', pathMatch: 'full' },
      { path: 'teams', component: TeamsComponent },
      { path: 'rounds', component: RoundsComponent },
      { path: 'matches', component: MatchesComponent },
      { path: 'standings', component: StandingsComponent },
    ]
  },
  // Legacy routes - redirect to first competition
  { path: 'league', redirectTo: 'competition/default', pathMatch: 'prefix' },
  { path: 'cup', redirectTo: 'competition/default', pathMatch: 'prefix' }
];