import express from 'express';
import { 
  createInspection, 
  getInspections, 
  updateInspection, 
  completeInspection 
} from '../controllers/inspectionController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, createInspection);
router.get('/', authenticateToken, getInspections);
router.get('/:id', authenticateToken, getInspections);
router.put('/:id', authenticateToken, updateInspection);
router.post('/:id/complete', authenticateToken, completeInspection);

export default router;
