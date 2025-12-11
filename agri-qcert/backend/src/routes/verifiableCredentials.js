import express from 'express';
import { 
  generateVC, 
  getVC, 
  verifyVC, 
  generateQRCode 
} from '../controllers/vcController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

router.post('/generate', authenticateToken, authorizeRole(['qa_agency', 'admin']), generateVC);
router.get('/:id', authenticateToken, getVC);
router.post('/verify', verifyVC);
router.get('/verify/:id', verifyVC);
router.get('/:id/qrcode', generateQRCode);

export default router;
