import express from 'express';
import { 
  obtenerMetricas, 
  obtenerAlertas, 
  marcarAlertaLeida 
} from '../controllers/dashboardController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/metricas', authenticateToken, obtenerMetricas);
router.get('/alertas', authenticateToken, obtenerAlertas);
router.put('/alertas/:id/leida', authenticateToken, marcarAlertaLeida);

export default router;