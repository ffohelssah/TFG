const { Market, Card, User, Chat } = require('../models');
const { sequelize } = require('../config/database');

// ================================================================================================
// CONTROLADOR DE MERCADO - MARKET CONTROLLER
// ================================================================================================
// Este controlador maneja todas las operaciones del marketplace de cartas:
// 1. Listado de cartas en el mercado
// 2. Consulta y búsqueda de listados
// 3. Gestión de listados del usuario
// 4. Actualización de estado de listados
// 5. Eliminación y remoción de cartas del mercado
// 
// CARACTERÍSTICAS PRINCIPALES:
// - Gestión completa del ciclo de vida de listados
// - Paginación y filtrado de resultados
// - Prevención de listados duplicados
// - Sincronización entre estado de carta y listado
// - Transacciones para consistencia de datos
// ================================================================================================

// ============================================================================================
// IMPORTACIONES
// ============================================================================================

// ============================================================================================
// LISTAR CARTA EN EL MERCADO
// ============================================================================================
// Endpoint: POST /api/market/list
// Función: Crear un nuevo listado de una carta en el marketplace
// Validaciones: Carta del usuario, sin listados activos duplicados
// Características: Reutilización de listados inactivos previos

// Listar una carta en el mercado
const listCard = async (req, res) => {
  try {
    const { cardId, price, description } = req.body;
    const userId = req.user.id;

    // Verificar que la carta existe y pertenece al usuario
    const card = await Card.findOne({
      where: { id: cardId, userId }
    });

    if (!card) {
      return res.status(404).json({ error: 'Carta no encontrada' });
    }

    // Verificar que la carta no esté ya listada activamente
    const existingListing = await Market.findOne({
      where: { 
        cardId,
        status: 'available'
      }
    });

    if (existingListing) {
      return res.status(400).json({ error: 'Esta carta ya está listada en el mercado' });
    }

    // Verificar si existe un listado previo inactivo (sold/pending) para reutilizarlo
    const inactiveListing = await Market.findOne({
      where: { 
        cardId,
        status: ['sold', 'pending']
      }
    });

    let listing;
    
    if (inactiveListing) {
      // Reutilizar el listado existente actualizando sus valores
      listing = await inactiveListing.update({
        sellerId: userId,
        price,
        description,
        status: 'available',
        listedAt: new Date()
      });
    } else {
      // Crear nuevo listado en el mercado
      listing = await Market.create({
        cardId,
        sellerId: userId,
        price,
        description,
        status: 'available'
      });
    }

    // Actualizar estado de la carta
    await card.update({ isListed: true, price });

    return res.status(201).json({
      message: 'Carta listada en el mercado correctamente',
      listing
    });
  } catch (error) {
    console.error('Error al listar carta en el mercado:', error);
    return res.status(500).json({ error: 'Error al listar la carta en el mercado' });
  }
};

// ============================================================================================
// OBTENER TODOS LOS LISTADOS DEL MERCADO
// ============================================================================================
// Endpoint: GET /api/market/listings
// Función: Recuperar listados disponibles con paginación y filtros
// Parámetros: status, sortBy, order, page, limit
// Includes: Datos de carta y vendedor para vista completa

// Obtener todos los listados del mercado
const getListings = async (req, res) => {
  try {
    const { status, sortBy, order, page = 1, limit = 10 } = req.query;
    
    // Construir condiciones de búsqueda
    const whereCondition = {};
    if (status) {
      whereCondition.status = status;
    } else {
      whereCondition.status = 'available'; // Por defecto mostrar solo disponibles
    }

    // Opciones de ordenación
    const orderOptions = [];
    if (sortBy) {
      orderOptions.push([sortBy, order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']);
    } else {
      orderOptions.push(['createdAt', 'DESC']); // Por defecto, los más recientes primero
    }

    // Paginación
    const offset = (page - 1) * limit;

    // Obtener listados
    const { count, rows: listings } = await Market.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: Card,
          attributes: ['id', 'name', 'edition', 'condition', 'imageUrl']
        },
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'username', 'profilePicture']
        }
      ],
      order: orderOptions,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Calcular total de páginas
    const totalPages = Math.ceil(count / limit);

    return res.status(200).json({
      listings,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages
      }
    });
  } catch (error) {
    console.error('Error al obtener listados del mercado:', error);
    return res.status(500).json({ error: 'Error al obtener los listados del mercado' });
  }
};

// ============================================================================================
// OBTENER DETALLE DE UN LISTADO
// ============================================================================================
// Endpoint: GET /api/market/listings/:id
// Función: Recuperar información completa de un listado específico
// Includes: Detalles de carta, vendedor y descripción completa

// Obtener detalle de un listado
const getListingById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const listing = await Market.findByPk(id, {
      include: [
        {
          model: Card,
          attributes: ['id', 'name', 'edition', 'condition', 'imageUrl', 'description']
        },
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'username', 'profilePicture']
        }
      ]
    });

    if (!listing) {
      return res.status(404).json({ error: 'Listado no encontrado' });
    }

    return res.status(200).json({ listing });
  } catch (error) {
    console.error('Error al obtener detalle del listado:', error);
    return res.status(500).json({ error: 'Error al obtener el detalle del listado' });
  }
};

// ============================================================================================
// OBTENER LISTADOS DEL USUARIO
// ============================================================================================
// Endpoint: GET /api/market/my-listings
// Función: Recuperar todos los listados creados por el usuario autenticado
// Ordenamiento: Por fecha de creación descendente

// Obtener listados del usuario
const getUserListings = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const listings = await Market.findAll({
      where: {
        sellerId: userId
      },
      include: [
        {
          model: Card,
          attributes: ['id', 'name', 'edition', 'condition', 'imageUrl']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({ listings });
  } catch (error) {
    console.error('Error al obtener listados del usuario:', error);
    return res.status(500).json({ error: 'Error al obtener los listados del usuario' });
  }
};

// ============================================================================================
// ACTUALIZAR LISTADO
// ============================================================================================
// Endpoint: PUT /api/market/listings/:id
// Función: Modificar precio, descripción o estado de un listado
// Transacciones: Sincronización automática con estado de carta
// Validación: Solo el propietario puede actualizar

// Actualizar un listado
const updateListing = async (req, res) => {
  try {
    const { id } = req.params;
    const { price, description, status } = req.body;
    const userId = req.user.id;
    
    // Verificar que el listado existe y pertenece al usuario
    const listing = await Market.findOne({
      where: {
        id,
        sellerId: userId
      },
      include: [{ model: Card }]
    });

    if (!listing) {
      return res.status(404).json({ error: 'Listado no encontrado' });
    }

    // Datos a actualizar
    const updateData = {};
    if (price !== undefined) updateData.price = price;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;

    // Actualizar en transacción para mantener consistencia
    await sequelize.transaction(async (t) => {
      // Actualizar listado
      await listing.update(updateData, { transaction: t });
      
      // Si se cambia el estado a "no disponible", actualizar también la carta
      if (status === 'sold' || status === 'pending') {
        await listing.Card.update({ isListed: false }, { transaction: t });
      } else if (status === 'available') {
        await listing.Card.update({ 
          isListed: true,
          price: price || listing.price 
        }, { transaction: t });
      }
    });

    return res.status(200).json({
      message: 'Listado actualizado correctamente',
      listing
    });
  } catch (error) {
    console.error('Error al actualizar listado:', error);
    return res.status(500).json({ error: 'Error al actualizar el listado' });
  }
};

// ============================================================================================
// ELIMINAR LISTADO
// ============================================================================================
// Endpoint: DELETE /api/market/listings/:id
// Función: Eliminar listado del mercado y actualizar estado de carta
// Transacciones: Garantiza consistencia entre Market y Card

// Eliminar un listado
const deleteListing = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Verificar que el listado existe y pertenece al usuario
    const listing = await Market.findOne({
      where: {
        id,
        sellerId: userId
      },
      include: [{ model: Card }]
    });

    if (!listing) {
      return res.status(404).json({ error: 'Listado no encontrado' });
    }

    // Eliminar en transacción para mantener consistencia
    await sequelize.transaction(async (t) => {
      // Eliminar listado
      await listing.destroy({ transaction: t });
      
      // Actualizar estado de la carta
      await listing.Card.update({ isListed: false }, { transaction: t });
    });

    return res.status(200).json({
      message: 'Listado eliminado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar listado:', error);
    return res.status(500).json({ error: 'Error al eliminar el listado' });
  }
};

// ============================================================================================
// REMOVER CARTA DEL MERCADO POR CARD ID
// ============================================================================================
// Endpoint: DELETE /api/market/unlist/:cardId
// Función: Remover carta del mercado usando ID de carta (más conveniente para frontend)
// Casos especiales: Manejo de estados inconsistentes, listados sin registro
// Transacciones: Limpieza completa de estados relacionados

// Eliminar un listado por cardId (más conveniente para el frontend)
const unlistCardByCardId = async (req, res) => {
  try {
    const { cardId } = req.params;
    const userId = req.user.id;
    
    // Primero verificar que la carta existe y pertenece al usuario
    const card = await Card.findOne({
      where: { id: cardId, userId }
    });

    if (!card) {
      return res.status(404).json({ error: 'Carta no encontrada' });
    }

    // Verificar si existe un listado en el mercado para esta carta
    const listing = await Market.findOne({
      where: {
        cardId,
        sellerId: userId
      }
    });

    // Caso 1: La carta tiene un listado activo en el mercado
    if (listing) {
      await sequelize.transaction(async (t) => {
        // Cambiar estado del listado a 'sold' en lugar de eliminarlo
        await listing.update({ 
          status: 'sold'
        }, { transaction: t });
        
        // Actualizar estado de la carta
        await card.update({ 
          isListed: false,
          price: null 
        }, { transaction: t });
      });

      return res.status(200).json({
        message: 'Carta removida del mercado correctamente'
      });
    }
    
    // Caso 2: La carta está marcada como listada pero no tiene registro en Markets
    // (estado inconsistente, posiblemente debido a un trade anterior)
    if (card.isListed) {
      await card.update({ 
        isListed: false,
        price: null 
      });

      return res.status(200).json({
        message: 'Estado de la carta corregido - removida del mercado'
      });
    }

    // Caso 3: La carta no está listada en absoluto
    return res.status(400).json({ 
      error: 'Esta carta no está listada en el mercado' 
    });

  } catch (error) {
    console.error('Error al remover carta del mercado:', error);
    return res.status(500).json({ error: 'Error al remover la carta del mercado' });
  }
};

module.exports = {
  listCard,
  getListings,
  getListingById,
  getUserListings,
  updateListing,
  deleteListing,
  unlistCardByCardId
}; 