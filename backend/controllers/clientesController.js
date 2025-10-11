import pool from '../config/database.js';

export const obtenerClientes = async (req, res) => {
  try {
    const { search } = req.query;
    
    let query = `
      SELECT 
        id, tipo_documento, numero_documento,
        nombres, apellido_paterno, apellido_materno,
        telefono, email, puntos_fidelidad, creado_en
      FROM clientes
      WHERE 1=1
    `;
    
    const params = [];
    
    if (search) {
      query += ` AND (
        nombres ILIKE $1 OR 
        apellido_paterno ILIKE $1 OR 
        apellido_materno ILIKE $1 OR
        numero_documento ILIKE $1
      )`;
      params.push(`%${search}%`);
    }
    
    query += ` ORDER BY apellido_paterno, nombres LIMIT 50`;
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });
    
  } catch (error) {
    console.error('Error obteniendo clientes:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener clientes'
    });
  }
};

export const crearCliente = async (req, res) => {
  try {
    const {
      tipo_documento,
      numero_documento,
      nombres,
      apellido_paterno,
      apellido_materno,
      telefono,
      email
    } = req.body;

    // Verificar si ya existe
    const existente = await pool.query(
      'SELECT id FROM clientes WHERE numero_documento = $1',
      [numero_documento]
    );

    if (existente.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Ya existe un cliente con este número de documento'
      });
    }

    const result = await pool.query(
      `INSERT INTO clientes 
       (tipo_documento, numero_documento, nombres, apellido_paterno, apellido_materno, telefono, email)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [tipo_documento, numero_documento, nombres, apellido_paterno, apellido_materno, telefono, email]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Cliente creado exitosamente'
    });

  } catch (error) {
    console.error('Error creando cliente:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear cliente'
    });
  }
};

export const actualizarPuntos = async (req, res) => {
  try {
    const { id } = req.params;
    const { puntos } = req.body;

    const result = await pool.query(
      'UPDATE clientes SET puntos_fidelidad = $1 WHERE id = $2 RETURNING *',
      [puntos, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Cliente no encontrado'
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Puntos actualizados correctamente'
    });

  } catch (error) {
    console.error('Error actualizando puntos:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar puntos'
    });
  }
};