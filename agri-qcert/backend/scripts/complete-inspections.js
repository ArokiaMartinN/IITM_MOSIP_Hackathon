import { pool } from '../src/config/database.js';

async function completeAllScheduledInspections() {
  try {
    console.log('Completing all scheduled inspections...');
    const result = await pool.query(
      `UPDATE inspections 
       SET status = 'completed', completed_at = NOW() 
       WHERE status = 'scheduled'
       RETURNING id, status`
    );
    console.log('Updated inspections:', result.rows);
    console.log('Total updated:', result.rowCount);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

completeAllScheduledInspections();
