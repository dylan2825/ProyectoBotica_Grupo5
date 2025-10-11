import express from 'express';
import { 
  obtenerClientes, 
  crearCliente, 
  actualizarPuntos 
} from '../controllers/clientesController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, obtenerClientes);
router.post('/', authenticateToken, crearCliente);
router.put('/:id/puntos', authenticateToken, actualizarPuntos);

export default router;