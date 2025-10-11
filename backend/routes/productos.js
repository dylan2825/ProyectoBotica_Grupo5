import express from 'express';
import { 
  obtenerProductos, 
  obtenerProductoPorId, 
  actualizarStock 
} from '../controllers/productosController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', obtenerProductos);
router.get('/:id', obtenerProductoPorId);
router.put('/:id/stock', authenticateToken, actualizarStock);

export default router;