import { migrateData } from '../../src/lib/dataMigration';
import { Command } from 'commander';
import prompts from 'prompts';

const program = new Command();

program
  .name('db-migrate')
  .description('CLI to migrate data from old DB to new DB')
  .version('1.0.0');

program.command('run')
  .description('Run the database migration')
  .action(async () => {
    const response = await prompts({
      type: 'confirm',
      name: 'confirm',
      message: '⚠️  This will migrate data from old DB to new DB. Are you sure?',
      initial: false
    });

    if (!response.confirm) {
      console.log('Migration cancelled');
      return;
    }

    try {
      console.log('Starting migration...');
      await migrateData();
      console.log('✅ Migration completed successfully');
    } catch (error) {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }
  });

program.parse();