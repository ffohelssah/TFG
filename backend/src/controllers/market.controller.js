const { Market, Card, User } = require('../models');
const { sequelize } = require('../config/database');

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

    // Verificar que la carta no esté ya listada
    const existingListing = await Market.findOne({
      where: { cardId }
    });

    if (existingListing) {
      return res.status(400).json({ error: 'Esta carta ya está listada en el mercado' });
    }

    // Crear listado en el mercado
    const listing = await Market.create({
      cardId,
      sellerId: userId,
      price,
      description,
      status: 'available'
    });

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

module.exports = {
  listCard,
  getListings,
  getListingById,
  getUserListings,
  updateListing,
  deleteListing
}; 