import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MigrationService } from './migration.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Veteranos';

  constructor(private migrationService: MigrationService) {}

  async ngOnInit() {
    // Run migration on app startup
    try {
      await this.migrationService.migrateToCompetitions();
    } catch (error) {
      console.error('Failed to run migration:', error);
    }
  }
}