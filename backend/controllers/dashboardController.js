import pool from '../config/database.js';

export const obtenerMetricas = async (req, res) => {
  try {
    // Ventas del día
    const ventasHoy = await pool.query(`
      SELECT 
        COUNT(*) as total_ventas,
        COALESCE(SUM(total_final), 0) as ingresos
      FROM ventas 
      WHERE DATE(creado_en) = CURRENT_DATE
    `);

    // Productos stock bajo
    const stockBajo = await pool.query(`
      SELECT COUNT(*) as total
      FROM productos 
      WHERE stock_actual <= stock_minimo AND activo = true
    `);

    // Productos más vendidos (última semana)
    const topProductos = await pool.query(`
      SELECT 
        p.nombre,
        SUM(dv.cantidad) as total_vendido
      FROM detalles_venta dv
      JOIN productos p ON dv.producto_id = p.id
      JOIN ventas v ON dv.venta_id = v.id
      WHERE v.creado_en >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY p.id, p.nombre
      ORDER BY total_vendido DESC
      LIMIT 5
    `);

    // Alertas no leídas
    const alertas = await pool.query(`
      SELECT COUNT(*) as total
      FROM alertas 
      WHERE leida = false
    `);

    res.json({
      success: true,
      data: {
        ventas_hoy: ventasHoy.rows[0],
        stock_bajo: stockBajo.rows[0],
        top_productos: topProductos.rows,
        alertas_pendientes: alertas.rows[0]
      }
    });

  } catch (error) {
    console.error('Error obteniendo métricas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener métricas del dashboard'
    });
  }
};

export const obtenerAlertas = async (req, res) => {
  try {
    const { leidas } = req.query;
    
    let query = `
      SELECT 
        a.*,
        p.nombre as producto_nombre
      FROM alertas a
      LEFT JOIN productos p ON a.producto_id = p.id
    `;
    
    const params = [];
    
    if (leidas === 'false') {
      query += ` WHERE a.leida = false`;
    }
    
    query += ` ORDER BY a.creado_en DESC LIMIT 50`;
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      data: result.rows
    });
    
  } catch (error) {
    console.error('Error obteniendo alertas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener alertas'
    });
  }
};

export const marcarAlertaLeida = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE alertas SET leida = true WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Alerta no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Alerta marcada como leída'
    });

  } catch (error) {
    console.error('Error marcando alerta:', error);
    res.status(500).json({
      success: false,
      error: 'Error al marcar alerta'
    });
  }
};