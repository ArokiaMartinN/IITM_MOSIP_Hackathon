import { pool } from '../config/database.js';

export const createInspection = async (req, res) => {
  try {
    const { batchId, qaAgencyId, scheduledDate } = req.body;

    if (!batchId || !qaAgencyId || !scheduledDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Update batch status
    await pool.query('UPDATE batches SET status = $1 WHERE id = $2', ['inspection_pending', Number(batchId)]);

    const result = await pool.query(
      `INSERT INTO inspections (batch_id, qa_agency_id, scheduled_date, status, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [Number(batchId), Number(qaAgencyId), scheduledDate, 'scheduled']
    );

    res.status(201).json({
      message: 'Inspection scheduled successfully',
      inspection: result.rows[0]
    });
  } catch (error) {
    console.error('Create inspection error:', error);
    res.status(500).json({ error: 'Failed to create inspection', message: error.message });
  }
};

export const getInspections = async (req, res) => {
  try {
    const { batchId, qaAgencyId, status } = req.query;
    let query = 'SELECT * FROM inspections WHERE 1=1';
    const params = [];

    if (batchId) {
      params.push(Number(batchId));
      query += ` AND batch_id = $${params.length}`;
    }

    if (qaAgencyId) {
      params.push(Number(qaAgencyId));
      query += ` AND qa_agency_id = $${params.length}`;
    }

    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json({ inspections: result.rows });
  } catch (error) {
    console.error('Get inspections error:', error);
    res.status(500).json({ error: 'Failed to fetch inspections', message: error.message });
  }
};

export const updateInspection = async (req, res) => {
  try {
    const { id } = req.params;
    const { moistureLevel, pesticideContent, organicStatus, isoCodes, notes } = req.body;

    const result = await pool.query(
      `UPDATE inspections SET moisture_level = $1, pesticide_content = $2, organic_status = $3, 
       iso_codes = $4, notes = $5, status = $6
       WHERE id = $7
       RETURNING *`,
      [Number(moistureLevel) || null, Number(pesticideContent) || null, organicStatus, isoCodes, notes, 'in_progress', Number(id)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inspection not found' });
    }

    res.json({
      message: 'Inspection updated successfully',
      inspection: result.rows[0]
    });
  } catch (error) {
    console.error('Update inspection error:', error);
    res.status(500).json({ error: 'Failed to update inspection', message: error.message });
  }
};

export const completeInspection = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE inspections SET status = $1, completed_at = NOW() WHERE id = $2 RETURNING *',
      ['completed', Number(id)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inspection not found' });
    }

    // Update batch status
    const inspection = result.rows[0];
    await pool.query('UPDATE batches SET status = $1 WHERE id = $2', ['inspection_completed', inspection.batch_id]);

    res.json({
      message: 'Inspection completed successfully',
      inspection: result.rows[0]
    });
  } catch (error) {
    console.error('Complete inspection error:', error);
    res.status(500).json({ error: 'Failed to complete inspection', message: error.message });
  }
};
