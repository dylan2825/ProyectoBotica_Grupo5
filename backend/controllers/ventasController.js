import pool from '../config/database.js';

export const procesarVenta = async (req, res) => {
  try {
    const { productos, cliente_id, descuento = 0 } = req.body;
    const usuario_id = req.user.id;

    if (!productos || !Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ error: 'Lista de productos requerida' });
    }

    await pool.query('BEGIN');

    // Generar código de venta
    const codigo_venta = 'V' + Date.now();

    // Verificar stock y calcular totales
    let total = 0;
    for (const item of productos) {
      const productoResult = await pool.query(
        'SELECT stock_actual, precio_venta, nombre FROM productos WHERE id = $1 AND activo = true',
        [item.producto_id]
      );

      if (productoResult.rows.length === 0) {
        await pool.query('ROLLBACK');
        return res.status(404).json({ error: `Producto ${item.producto_id} no encontrado` });
      }

      const producto = productoResult.rows[0];
      
      if (producto.stock_actual < item.cantidad) {
        await pool.query('ROLLBACK');
        return res.status(400).json({ 
          error: `Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock_actual}` 
        });
      }

      const subtotal = item.cantidad * producto.precio_venta;
      total += subtotal;
    }

    const total_final = total - descuento;

    // Insertar venta
    const ventaResult = await pool.query(
      `INSERT INTO ventas (codigo_venta, cliente_id, total, descuento, total_final, usuario_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [codigo_venta, cliente_id, total, descuento, total_final, usuario_id]
    );

    const venta_id = ventaResult.rows[0].id;

    // Insertar detalles y actualizar stock
    for (const item of productos) {
      const productoResult = await pool.query(
        'SELECT precio_venta FROM productos WHERE id = $1',
        [item.producto_id]
      );

      const precio_unitario = productoResult.rows[0].precio_venta;
      const subtotal = item.cantidad * precio_unitario;

      // Insertar detalle
      await pool.query(
        `INSERT INTO detalles_venta (venta_id, producto_id, cantidad, precio_unitario, subtotal)
         VALUES ($1, $2, $3, $4, $5)`,
        [venta_id, item.producto_id, item.cantidad, precio_unitario, subtotal]
      );

      // Actualizar stock
      await pool.query(
        'UPDATE productos SET stock_actual = stock_actual - $1 WHERE id = $2',
        [item.cantidad, item.producto_id]
      );

      // Registrar movimiento de inventario
      await pool.query(
        `INSERT INTO movimientos_inventario 
         (producto_id, tipo_movimiento, cantidad, stock_anterior, stock_actual, motivo, usuario_id)
         SELECT 
           $1, 'salida', $2, 
           stock_actual + $2, stock_actual,
           $3, $4
         FROM productos WHERE id = $1`,
        [item.producto_id, item.cantidad, `Venta ${codigo_venta}`, usuario_id]
      );
    }

    // Actualizar puntos de fidelidad si hay cliente
    if (cliente_id) {
      const puntos = Math.floor(total_final / 10); // 1 punto por cada S/10
      await pool.query(
        'UPDATE clientes SET puntos_fidelidad = puntos_fidelidad + $1 WHERE id = $2',
        [puntos, cliente_id]
      );
    }

    await pool.query('COMMIT');

    res.json({
      success: true,
      venta: {
        id: venta_id,
        codigo_venta,
        total,
        descuento,
        total_final
      },
      message: 'Venta procesada exitosamente'
    });

  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error procesando venta:', error);
    res.status(500).json({ error: 'Error procesando venta' });
  }
};

export const obtenerVentas = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, page = 1, limit = 50 } = req.query;
    
    let query = `
      SELECT 
        v.id, v.codigo_venta, v.total, v.descuento, v.total_final, v.creado_en,
        c.nombres as cliente_nombres, c.apellido_paterno as cliente_apellido,
        u.nombre as usuario_nombre
      FROM ventas v
      LEFT JOIN clientes c ON v.cliente_id = c.id
      LEFT JOIN usuarios u ON v.usuario_id = u.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 0;

    if (fecha_inicio) {
      paramCount++;
      query += ` AND DATE(v.creado_en) >= $${paramCount}`;
      params.push(fecha_inicio);
    }

    if (fecha_fin) {
      paramCount++;
      query += ` AND DATE(v.creado_en) <= $${paramCount}`;
      params.push(fecha_fin);
    }

    query += ` ORDER BY v.creado_en DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, (page - 1) * limit);

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.rows.length
      }
    });

  } catch (error) {
    console.error('Error obteniendo ventas:', error);
    res.status(500).json({ error: 'Error obteniendo ventas' });
  }
};