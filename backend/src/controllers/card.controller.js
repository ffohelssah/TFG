// ================================================================================================
// CONTROLADOR DE CARTAS - CARD CONTROLLER
// ================================================================================================
// Este controlador maneja todas las operaciones CRUD para las cartas de los usuarios:
// 1. Creación de cartas con subida de imágenes
// 2. Consulta de cartas del usuario
// 3. Actualización de información y imágenes
// 4. Eliminación con limpieza de relaciones
// 
// CARACTERÍSTICAS PRINCIPALES:
// - Gestión de archivos de imagen (subida, actualización, eliminación)
// - Transacciones para mantener consistencia de datos
// - Validación de propiedad (solo el dueño puede modificar sus cartas)
// - Limpieza automática de relaciones al eliminar cartas
// ================================================================================================

// ============================================================================================
// IMPORTACIONES
// ============================================================================================
const { Card, Market, Chat, Message, Trade } = require('../models'); // Modelos relacionados
const { sequelize } = require('../config/database');                 // Transacciones
const path = require('path');                                        // Manejo de rutas
const fs = require('fs');                                           // Sistema de archivos

// ============================================================================================
// CREAR NUEVA CARTA
// ============================================================================================
// Endpoint: POST /api/cards
// Función: Crear una nueva carta en la colección del usuario
// Archivos: Requiere subida de imagen (middleware multer)
// Validación: Usuario autenticado, imagen obligatoria
const createCard = async (req, res) => {
  try {
    const { name, edition, condition, description } = req.body;
    const userId = req.user.id;
    
    // ========================================================================================
    // VALIDACIÓN DE IMAGEN REQUERIDA
    // ========================================================================================
    // Verificar que se haya subido una imagen (procesada por multer middleware)
    if (!req.file) {
      return res.status(400).json({ error: 'Se requiere una imagen de la carta' });
    }

    // ========================================================================================
    // PROCESAMIENTO DE IMAGEN
    // ========================================================================================
    // Construir ruta relativa para la imagen subida
    const imageUrl = `/uploads/${req.file.filename}`;

    // ========================================================================================
    // CREACIÓN EN BASE DE DATOS
    // ========================================================================================
    // Crear registro de la carta en la base de datos
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

// ============================================================================================
// OBTENER CARTAS DEL USUARIO
// ============================================================================================
// Endpoint: GET /api/cards
// Función: Recuperar todas las cartas que pertenecen al usuario autenticado
// Ordenamiento: Por fecha de creación (más recientes primero)
const getUserCards = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // ========================================================================================
    // CONSULTA DE CARTAS DEL USUARIO
    // ========================================================================================
    // Obtener todas las cartas del usuario ordenadas por fecha de creación
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

// ============================================================================================
// OBTENER CARTA POR ID
// ============================================================================================
// Endpoint: GET /api/cards/:id
// Función: Recuperar una carta específica del usuario
// Validación: Verificar que la carta pertenezca al usuario autenticado
const getCardById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // ========================================================================================
    // BÚSQUEDA CON VALIDACIÓN DE PROPIEDAD
    // ========================================================================================
    // Buscar carta que pertenezca al usuario autenticado
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

// ============================================================================================
// ACTUALIZAR CARTA
// ============================================================================================
// Endpoint: PUT /api/cards/:id
// Función: Actualizar información de una carta existente
// Características: Permite actualización parcial, cambio de imagen opcional
// Validación: Solo el propietario puede actualizar
const updateCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, edition, condition, description, isListed, price } = req.body;
    const userId = req.user.id;
    
    // ========================================================================================
    // VALIDACIÓN DE EXISTENCIA Y PROPIEDAD
    // ========================================================================================
    // Buscar la carta y verificar que pertenezca al usuario
    const card = await Card.findOne({
      where: { id, userId }
    });

    if (!card) {
      return res.status(404).json({ error: 'Carta no encontrada' });
    }

    // ========================================================================================
    // PREPARACIÓN DE DATOS DE ACTUALIZACIÓN
    // ========================================================================================
    // Construir objeto con datos a actualizar (mantener valores existentes si no se proporcionan)
    const updateData = {
      name: name || card.name,
      edition: edition || card.edition,
      condition: condition || card.condition,
      description: description !== undefined ? description : card.description,
      isListed: isListed !== undefined ? isListed : card.isListed,
      price: price !== undefined ? price : card.price
    };

    // ========================================================================================
    // GESTIÓN DE IMAGEN (SI SE PROPORCIONA NUEVA)
    // ========================================================================================
    // Si se subió una nueva imagen
    if (req.file) {
      // Eliminar imagen anterior (si no es la default)
      const oldImagePath = path.join(__dirname, '../../', card.imageUrl);
      if (fs.existsSync(oldImagePath) && !card.imageUrl.includes('default')) {
        fs.unlinkSync(oldImagePath);
      }
      
      // Actualizar con nueva imagen
      updateData.imageUrl = `/uploads/${req.file.filename}`;
    }

    // ========================================================================================
    // ACTUALIZACIÓN EN BASE DE DATOS
    // ========================================================================================
    // Aplicar cambios a la carta
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

// ============================================================================================
// ELIMINAR CARTA
// ============================================================================================
// Endpoint: DELETE /api/cards/:id
// Función: Eliminar carta y todas sus relaciones del sistema
// Complejidad: Limpieza en cascada de listados, chats, mensajes y trades
// Transacción: Garantiza consistencia de datos
const deleteCard = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // ========================================================================================
    // VALIDACIÓN DE EXISTENCIA Y PROPIEDAD
    // ========================================================================================
    // Buscar la carta y verificar que pertenezca al usuario
    const card = await Card.findOne({
      where: { id, userId }
    });

    if (!card) {
      return res.status(404).json({ error: 'Carta no encontrada' });
    }

    // ========================================================================================
    // ELIMINACIÓN EN TRANSACCIÓN (GARANTIZA CONSISTENCIA)
    // ========================================================================================
    // Usar transacción para mantener integridad referencial
    await sequelize.transaction(async (t) => {
      // ==================================================================================
      // PASO 1: ENCONTRAR LISTADOS DE MERCADO RELACIONADOS
      // ==================================================================================
      const marketListings = await Market.findAll({
        where: { cardId: id },
        transaction: t
      });

      // ==================================================================================
      // PASO 2: LIMPIAR RELACIONES DE CADA LISTADO
      // ==================================================================================
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

      // ==================================================================================
      // PASO 3: ELIMINAR ARCHIVO DE IMAGEN
      // ==================================================================================
      // Eliminar imagen del sistema de archivos (si no es default)
      const imagePath = path.join(__dirname, '../../', card.imageUrl);
      if (fs.existsSync(imagePath) && !card.imageUrl.includes('default')) {
        fs.unlinkSync(imagePath);
      }

      // ==================================================================================
      // PASO 4: ELIMINAR LA CARTA
      // ==================================================================================
      // Finalmente eliminar la carta de la base de datos
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

// ============================================================================================
// EXPORTACIÓN DE FUNCIONES
// ============================================================================================
module.exports = {
  createCard,    // Crear nueva carta con imagen
  getUserCards,  // Obtener cartas del usuario
  getCardById,   // Obtener carta específica
  updateCard,    // Actualizar carta existente
  deleteCard     // Eliminar carta y relaciones
}; 