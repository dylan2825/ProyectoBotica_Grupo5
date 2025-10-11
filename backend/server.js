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

// 🔍 VERIFICAR CONEXIÓN A LA BASE DE DATOS AL INICIAR
const testDatabaseConnection = async () => {
  try {
    console.log('🔗 Intentando conectar a la base de datos...');
    const result = await pool.query('SELECT NOW() as current_time, version() as postgres_version');
    console.log('✅ CONEXIÓN EXITOSA a Supabase PostgreSQL');
    console.log('   📅 Hora de la BD:', result.rows[0].current_time);
    console.log('   🐘 PostgreSQL:', result.rows[0].postgres_version.split(',')[0]);
    console.log('   🌐 Estado: OPERATIVA');
    return true;
  } catch (error) {
    console.log('❌ ERROR de conexión a la base de datos:');
    console.log('   📍 Host:', process.env.DB_HOST);
    console.log('   🗂️  Base de datos:', process.env.DB_NAME);
    console.log('   👤 Usuario:', process.env.DB_USER);
    console.log('   🔑 Error:', error.message);
    console.log('   🌐 Estado: NO CONECTADA');
    return false;
  }
};

// Test de conexión a BD
app.get('/test-db', async (req, res) => {
  try {
    console.log('🧪 Test de conexión a BD solicitado...');
    const result = await pool.query('SELECT NOW() as current_time, current_database() as db_name, current_user as db_user');
    
    const dbInfo = {
      database: '✅ Conectado a Supabase PostgreSQL',
      time: result.rows[0].current_time,
      db_name: result.rows[0].db_name,
      db_user: result.rows[0].db_user,
      message: 'Conexión exitosa a la base de datos',
      status: 'OPERATIVA'
    };
    
    console.log('📊 Info BD:', dbInfo);
    res.json(dbInfo);
  } catch (error) {
    console.error('💥 Error en test de BD:', error.message);
    res.status(500).json({
      error: '❌ Error conectando a la base de datos',
      details: error.message,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      status: 'NO CONECTADA'
    });
  }
});

// Test de conexión a tablas específicas
app.get('/test-tables', async (req, res) => {
  try {
    console.log('📋 Verificando tablas...');
    
    // Verificar si existen las tablas principales
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('usuarios', 'productos', 'clientes', 'ventas')
    `;
    
    const tablesResult = await pool.query(tablesQuery);
    const existingTables = tablesResult.rows.map(row => row.table_name);
    
    console.log('📦 Tablas existentes:', existingTables);
    
    res.json({
      message: 'Verificación de tablas completada',
      tables: existingTables,
      total_tables: existingTables.length,
      status: existingTables.length > 0 ? 'TABLAS OK' : 'NO HAY TABLAS'
    });
    
  } catch (error) {
    console.error('💥 Error verificando tablas:', error);
    res.status(500).json({
      error: 'Error verificando tablas',
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

// Health check extendido
app.get('/health', async (req, res) => {
  try {
    // Verificar conexión a BD en cada health check
    const dbResult = await pool.query('SELECT 1 as status');
    const dbStatus = dbResult.rows[0].status === 1 ? 'CONECTADA' : 'ERROR';
    
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: {
        status: dbStatus,
        host: process.env.DB_HOST,
        name: process.env.DB_NAME
      },
      system: {
        node_version: process.version,
        platform: process.platform,
        uptime: process.uptime()
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      database: {
        status: 'NO CONECTADA',
        error: error.message
      }
    });
  }
});

// Ruta principal con info del sistema
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 Backend Botica Nova Salud - Conectado!',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    database: {
      host: process.env.DB_HOST,
      name: process.env.DB_NAME,
      user: process.env.DB_USER
    },
    endpoints: {
      auth: '/api/auth',
      productos: '/api/productos',
      ventas: '/api/ventas',
      clientes: '/api/clientes',
      dashboard: '/api/dashboard',
      test_db: '/test-db',
      test_tables: '/test-tables',
      health: '/health'
    }
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('💥 Error del servidor:', err.stack);
  res.status(500).json({ 
    error: 'Algo salió mal en el servidor',
    details: err.message
  });
});

// Ruta no encontrada
app.use('*', (req, res) => {
  console.log('🔍 Ruta no encontrada:', req.originalUrl);
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

// Iniciar servidor con verificación de BD
const startServer = async () => {
  try {
    // Verificar conexión a BD antes de iniciar
    const dbConnected = await testDatabaseConnection();
    
    if (!dbConnected) {
      console.log('⚠️  ADVERTENCIA: Servidor iniciando SIN conexión a BD');
      console.log('💡 Solución: Verifica tu archivo .env y la conexión a Supabase');
    }
    
    app.listen(PORT, () => {
      console.log(`\n🎯 Servidor corriendo en puerto ${PORT}`);
      console.log(`📊 Entorno: ${process.env.NODE_ENV}`);
      console.log(`💾 Base de datos: ${dbConnected ? '✅ CONECTADA' : '❌ NO CONECTADA'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`🗄️  Test DB: http://localhost:${PORT}/test-db`);
      console.log(`📋 Test Tablas: http://localhost:${PORT}/test-tables`);
      console.log('📚 Endpoints disponibles:');
      console.log('   🔐 Auth: http://localhost:3000/api/auth');
      console.log('   🛍️  Productos: http://localhost:3000/api/productos');
      console.log('   💰 Ventas: http://localhost:3000/api/ventas');
      console.log('   👥 Clientes: http://localhost:3000/api/clientes');
      console.log('   📊 Dashboard: http://localhost:3000/api/dashboard');
      console.log('\n🚀 Servidor listo para recibir peticiones\n');
    });
    
  } catch (error) {
    console.error('💥 Error al iniciar servidor:', error);
    process.exit(1);
  }
};

// Iniciar la aplicación
startServer();