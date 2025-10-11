import express from 'express';
import { procesarVenta, obtenerVentas } from '../controllers/ventasController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, procesarVenta);
router.get('/', authenticateToken, obtenerVentas);

export default router;