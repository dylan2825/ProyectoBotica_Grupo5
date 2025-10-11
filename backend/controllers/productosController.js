import pool from '../config/database.js';

export const obtenerProductos = async (req, res) => {
  try {
    const { search, categoria_id, stock_bajo } = req.query;
    
    let query = `
      SELECT 
        p.id, p.codigo, p.nombre, p.descripcion,
        p.precio_compra, p.precio_venta,
        p.stock_actual, p.stock_minimo, p.activo,
        c.nombre as categoria_nombre
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.activo = true
    `;
    
    const params = [];
    let paramCount = 0;
    
    if (search) {
      paramCount++;
      query += ` AND (p.nombre ILIKE $${paramCount} OR p.codigo ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }
    
    if (categoria_id) {
      paramCount++;
      query += ` AND p.categoria_id = $${paramCount}`;
      params.push(categoria_id);
    }
    
    if (stock_bajo === 'true') {
      query += ` AND p.stock_actual <= p.stock_minimo`;
    }
    
    query += ` ORDER BY p.nombre LIMIT 100`;
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });
    
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener productos'
    });
  }
};

export const obtenerProductoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        p.*,
        c.nombre as categoria_nombre
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.id = $1 AND p.activo = true
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error obteniendo producto:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener producto'
    });
  }
};

export const actualizarStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock_actual, motivo } = req.body;
    const usuario_id = req.user.id;

    await pool.query('BEGIN');

    // Obtener stock anterior
    const productoResult = await pool.query(
      'SELECT stock_actual FROM productos WHERE id = $1',
      [id]
    );

    if (productoResult.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const stock_anterior = productoResult.rows[0].stock_actual;
    const diferencia = stock_actual - stock_anterior;
    const tipo_movimiento = diferencia > 0 ? 'entrada' : 'salida';

    // Actualizar producto
    await pool.query(
      'UPDATE productos SET stock_actual = $1 WHERE id = $2',
      [stock_actual, id]
    );

    // Registrar movimiento
    await pool.query(
      `INSERT INTO movimientos_inventario 
       (producto_id, tipo_movimiento, cantidad, stock_anterior, stock_actual, motivo, usuario_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, tipo_movimiento, Math.abs(diferencia), stock_anterior, stock_actual, motivo, usuario_id]
    );

    await pool.query('COMMIT');

    res.json({
      success: true,
      message: 'Stock actualizado correctamente'
    });

  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error actualizando stock:', error);
    res.status(500).json({ error: 'Error actualizando stock' });
  }
};