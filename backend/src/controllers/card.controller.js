const { Card, Market, Chat, Message, Trade } = require('../models');
const { sequelize } = require('../config/database');
const path = require('path');
const fs = require('fs');

// Crear una nueva carta
const createCard = async (req, res) => {
  try {
    const { name, edition, condition, description } = req.body;
    const userId = req.user.id;
    
    // Verificar si se subió una imagen
    if (!req.file) {
      return res.status(400).json({ error: 'Se requiere una imagen de la carta' });
    }

    // Obtener la ruta de la imagen
    const imageUrl = `/uploads/${req.file.filename}`;

    // Crear la carta en la base de datos
    const card = await Card.create({
      name,
      edition,
      condition,
      description,
      imageUrl,
      userId
    });

    return res.status(201).json({ 
      message: 'Carta creada correctamente',
      card 
    });
  } catch (error) {
    console.error('Error al crear carta:', error);
    return res.status(500).json({ error: 'Error al crear la carta' });
  }
};

// Obtener todas las cartas del usuario autenticado
const getUserCards = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const cards = await Card.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({ cards });
  } catch (error) {
    console.error('Error al obtener cartas del usuario:', error);
    return res.status(500).json({ error: 'Error al obtener las cartas del usuario' });
  }
};

// Obtener una carta por su ID
const getCardById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const card = await Card.findOne({
      where: { id, userId }
    });

    if (!card) {
      return res.status(404).json({ error: 'Carta no encontrada' });
    }

    return res.status(200).json({ card });
  } catch (error) {
    console.error('Error al obtener carta:', error);
    return res.status(500).json({ error: 'Error al obtener la carta' });
  }
};

// Actualizar una carta
const updateCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, edition, condition, description, isListed, price } = req.body;
    const userId = req.user.id;
    
    // Buscar la carta
    const card = await Card.findOne({
      where: { id, userId }
    });

    if (!card) {
      return res.status(404).json({ error: 'Carta no encontrada' });
    }

    // Datos a actualizar
    const updateData = {
      name: name || card.name,
      edition: edition || card.edition,
      condition: condition || card.condition,
      description: description !== undefined ? description : card.description,
      isListed: isListed !== undefined ? isListed : card.isListed,
      price: price !== undefined ? price : card.price
    };

    // Si hay una nueva imagen
    if (req.file) {
      // Eliminar imagen anterior (si no es la default)
      const oldImagePath = path.join(__dirname, '../../', card.imageUrl);
      if (fs.existsSync(oldImagePath) && !card.imageUrl.includes('default')) {
        fs.unlinkSync(oldImagePath);
      }
      
      // Actualizar con nueva imagen
      updateData.imageUrl = `/uploads/${req.file.filename}`;
    }

    // Actualizar carta
    await card.update(updateData);

    return res.status(200).json({ 
      message: 'Carta actualizada correctamente',
      card 
    });
  } catch (error) {
    console.error('Error al actualizar carta:', error);
    return res.status(500).json({ error: 'Error al actualizar la carta' });
  }
};

// Eliminar una carta
const deleteCard = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Buscar la carta
    const card = await Card.findOne({
      where: { id, userId }
    });

    if (!card) {
      return res.status(404).json({ error: 'Carta no encontrada' });
    }

    // Usar transacción para mantener consistencia
    await sequelize.transaction(async (t) => {
      // 1. Encontrar todos los listados de mercado para esta carta
      const marketListings = await Market.findAll({
        where: { cardId: id },
        transaction: t
      });

      // 2. Para cada listado de mercado, limpiar las relaciones
      for (const listing of marketListings) {
        // 2a. Encontrar chats relacionados con este listado
        const chats = await Chat.findAll({
          where: { marketId: listing.id },
          transaction: t
        });

        // 2b. Para cada chat, eliminar trades y mensajes
        for (const chat of chats) {
          // Eliminar trades relacionados
          await Trade.destroy({
            where: { chatId: chat.id },
            transaction: t
          });

          // Eliminar mensajes relacionados
          await Message.destroy({
            where: { chatId: chat.id },
            transaction: t
          });

          // Eliminar el chat
          await chat.destroy({ transaction: t });
        }

        // 2c. Eliminar el listado del mercado
        await listing.destroy({ transaction: t });
      }

      // 3. Eliminar imagen (si no es la default)
      const imagePath = path.join(__dirname, '../../', card.imageUrl);
      if (fs.existsSync(imagePath) && !card.imageUrl.includes('default')) {
        fs.unlinkSync(imagePath);
      }

      // 4. Finalmente eliminar la carta
      await card.destroy({ transaction: t });
    });

    return res.status(200).json({ 
      message: 'Carta eliminada correctamente' 
    });
  } catch (error) {
    console.error('Error al eliminar carta:', error);
    return res.status(500).json({ error: 'Error al eliminar la carta' });
  }
};

module.exports = {
  createCard,
  getUserCards,
  getCardById,
  updateCard,
  deleteCard
}; 