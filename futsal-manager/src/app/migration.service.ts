// src/app/migration.service.ts
import { Injectable } from '@angular/core';
import { AppDB } from './db.service';
import { CompetitionService } from './competiton.service';

@Injectable({ providedIn: 'root' })
export class MigrationService {
  constructor(
    private db: AppDB,
    private competitionService: CompetitionService
  ) {}

  /**
   * Migrates existing data to new schema with competitions
   * Call this once on app initialization
   */
  async migrateToCompetitions(): Promise<void> {
    try {
      // Check if migration is needed
      const competitions = await this.db.competitions.toArray();

      // If we already have competitions, no need to migrate
      if (competitions.length > 0) {
        console.log('Competitions already exist, skipping migration');
        return;
      }

      // Check if we have any old data
      const teams = await this.db.teams.toArray();
      const rounds = await this.db.rounds.toArray();
      const matches = await this.db.matches.toArray();

      // If no old data, just initialize competitions
      if (teams.length === 0 && rounds.length === 0 && matches.length === 0) {
        console.log('No existing data, initializing default competitions');
        await this.competitionService.initializeDefaultCompetitions();
        return;
      }

      console.log('Starting migration to competition structure...');

      // Create a default competition for existing data
      const defaultCompetition = await this.competitionService.createCompetition(
        'Liga AFSA Veteranos',
        'Veteranos',
        '🏅',
        'league'
      );

      console.log(`Created default competition: ${defaultCompetition.name}`);

      // Migrate teams
      for (const team of teams) {
        if (!(team as any).competitionId) {
          await this.db.teams.update(team.id, {
            competitionId: defaultCompetition.id
          });
        }
      }
      console.log(`Migrated ${teams.length} teams`);

      // Migrate rounds
      for (const round of rounds) {
        if (!(round as any).competitionId) {
          await this.db.rounds.update(round.id, {
            competitionId: defaultCompetition.id
          });
        }
      }
      console.log(`Migrated ${rounds.length} rounds`);

      // Migrate matches
      for (const match of matches) {
        if (!(match as any).competitionId) {
          await this.db.matches.update(match.id, {
            competitionId: defaultCompetition.id
          });
        }
      }
      console.log(`Migrated ${matches.length} matches`);

      // Create second competition
      await this.competitionService.createCompetition(
        'Liga AFSA Seniores',
        'Seniores',
        '⚽',
        'league'
      );

      console.log('Migration completed successfully!');
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }

  /**
   * Reset all data and start fresh
   */
  async resetDatabase(): Promise<void> {
    if (!confirm('⚠️ ATENÇÃO: Isto vai apagar TODOS os dados. Tem certeza?')) {
      return;
    }

    await this.db.transaction('rw',
      [this.db.competitions,
      this.db.teams,
      this.db.rounds,
      this.db.matches,
      this.db.goals],
      async () => {
        await this.db.competitions.clear();
        await this.db.teams.clear();
        await this.db.rounds.clear();
        await this.db.matches.clear();
        await this.db.goals.clear();
      }
    );

    // Initialize default competitions
    await this.competitionService.initializeDefaultCompetitions();

    alert('Base de dados reiniciada com sucesso!');
    window.location.reload();
  }
}