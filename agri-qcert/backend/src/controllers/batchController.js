import { pool } from '../config/database.js';

export const createBatch = async (req, res) => {
  try {
    const { productType, quantity, unit = 'kg', location, destination, notes } = req.body;
    const exporterId = req.user?.id;

    console.log('Creating batch with data:', { productType, quantity, unit, location, destination, notes, exporterId, user: req.user });

    if (!productType || !quantity || !location || !destination) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!exporterId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const result = await pool.query(
      `INSERT INTO batches (product_type, quantity, unit, location, destination, exporter_id, status, notes, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       RETURNING *`,
      [productType, Number(quantity), unit, location, destination, Number(exporterId), 'submitted', notes || null]
    );

    res.status(201).json({
      message: 'Batch created successfully',
      batch: result.rows[0]
    });
  } catch (error) {
    console.error('Create batch error:', error);
    res.status(500).json({ error: 'Failed to create batch', message: error.message });
  }
};

export const getBatches = async (req, res) => {
  try {
    const { status, exporterId } = req.query;
    let query = 'SELECT * FROM batches WHERE 1=1';
    const params = [];

    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }

    if (exporterId) {
      params.push(exporterId);
      query += ` AND exporter_id = $${params.length}`;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json({ batches: result.rows });
  } catch (error) {
    console.error('Get batches error:', error);
    res.status(500).json({ error: 'Failed to fetch batches', message: error.message });
  }
};

export const getBatchById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM batches WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    res.json({ batch: result.rows[0] });
  } catch (error) {
    console.error('Get batch error:', error);
    res.status(500).json({ error: 'Failed to fetch batch', message: error.message });
  }
};

export const updateBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const { productType, quantity, unit = 'kg', location, destination, notes } = req.body;

    const result = await pool.query(
      `UPDATE batches 
       SET product_type = $1, quantity = $2, unit = $3, location = $4, destination = $5, notes = $6, updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [productType, quantity, unit, location, destination, notes, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    res.json({
      message: 'Batch updated successfully',
      batch: result.rows[0]
    });
  } catch (error) {
    console.error('Update batch error:', error);
    res.status(500).json({ error: 'Failed to update batch', message: error.message });
  }
};

export const deleteBatch = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM batches WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    res.json({ message: 'Batch deleted successfully' });
  } catch (error) {
    console.error('Delete batch error:', error);
    res.status(500).json({ error: 'Failed to delete batch', message: error.message });
  }
};
