import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/database.js';

// Importar rutas
import authRoutes from './routes/auth.js';
import productoRoutes from './routes/productos.js';
import ventaRoutes from './routes/ventas.js';
import clienteRoutes from './routes/clientes.js';
import dashboardRoutes from './routes/dashboard.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Test de conexión a BD
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as current_time');
    res.json({
      database: '✅ Conectado a Supabase PostgreSQL',
      time: result.rows[0].current_time,
      message: 'Conexión exitosa a la base de datos'
    });
  } catch (error) {
    res.status(500).json({
      error: '❌ Error conectando a la base de datos',
      details: error.message
    });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/ventas', ventaRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Ruta principal
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 Backend Botica Nova Salud - Conectado!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      productos: '/api/productos',
      ventas: '/api/ventas',
      clientes: '/api/clientes',
      dashboard: '/api/dashboard',
      test_db: '/test-db'
    }
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Algo salió mal en el servidor' 
  });
});

// Ruta no encontrada
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada' 
  });
});

app.listen(PORT, () => {
  console.log(`🎯 Servidor corriendo en puerto ${PORT}`);
  console.log(`📊 Entorno: ${process.env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🗄️  Test DB: http://localhost:${PORT}/test-db`);
  console.log('📚 Endpoints disponibles:');
  console.log('   🔐 Auth: http://localhost:3000/api/auth');
  console.log('   🛍️  Productos: http://localhost:3000/api/productos');
  console.log('   💰 Ventas: http://localhost:3000/api/ventas');
  console.log('   👥 Clientes: http://localhost:3000/api/clientes');
  console.log('   📊 Dashboard: http://localhost:3000/api/dashboard');
});