import express from 'express';
import { createBatch, getBatches, getBatchById, updateBatch, deleteBatch } from '../controllers/batchController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, createBatch);
router.get('/', authenticateToken, getBatches);
router.get('/:id', authenticateToken, getBatchById);
router.put('/:id', authenticateToken, updateBatch);
router.delete('/:id', authenticateToken, deleteBatch);

export default router;
