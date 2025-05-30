const { Trade, Chat, Market, User, Card } = require('../models');
const { Op } = require('sequelize');

// Iniciar un trade
const initiateTrade = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    // Verificar que el chat existe y el usuario es parte de él
    const chat = await Chat.findOne({
      where: {
        id: chatId,
        [Op.or]: [
          { userId1: userId },
          { userId2: userId }
        ]
      },
      include: [
        {
          model: Market,
          include: [{ model: Card }]
        }
      ]
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found or access denied' });
    }

    // Verificar que no hay un trade activo
    const existingTrade = await Trade.findOne({
      where: {
        chatId,
        status: ['pending', 'buyer_accepted', 'seller_accepted', 'both_accepted']
      }
    });

    if (existingTrade) {
      return res.status(400).json({ error: 'There is already an active trade for this chat' });
    }

    // Determinar quién es el buyer y quién es el seller
    const sellerId = chat.Market.sellerId;
    const buyerId = userId === sellerId ? (chat.userId1 === sellerId ? chat.userId2 : chat.userId1) : userId;

    if (userId === sellerId) {
      return res.status(400).json({ error: 'Seller cannot initiate trade' });
    }

    // Crear el trade
    const trade = await Trade.create({
      chatId,
      marketId: chat.marketId,
      buyerId,
      sellerId,
      price: chat.Market.price,
      status: 'pending'
    });

    return res.status(201).json({
      trade,
      message: 'Trade initiated successfully'
    });

  } catch (error) {
    console.error('Error initiating trade:', error);
    return res.status(500).json({ error: 'Error initiating trade' });
  }
};

// Aceptar trade
const acceptTrade = async (req, res) => {
  try {
    const { tradeId } = req.params;
    const userId = req.user.id;

    const trade = await Trade.findOne({
      where: {
        id: tradeId,
        [Op.or]: [
          { buyerId: userId },
          { sellerId: userId }
        ],
        status: ['pending', 'buyer_accepted', 'seller_accepted']
      },
      include: [
        { model: User, as: 'buyer' },
        { model: User, as: 'seller' },
        { model: Market, include: [{ model: Card }] }
      ]
    });

    if (!trade) {
      return res.status(404).json({ error: 'Trade not found or cannot be accepted' });
    }

    const isBuyer = trade.buyerId === userId;
    const isSeller = trade.sellerId === userId;

    let newStatus = trade.status;
    let message = '';

    if (isBuyer && !trade.buyerAccepted) {
      trade.buyerAccepted = true;
      trade.buyerAcceptedAt = new Date();
      
      if (trade.sellerAccepted) {
        newStatus = 'both_accepted';
        message = 'Both parties accepted. Trade will be completed.';
      } else {
        newStatus = 'buyer_accepted';
        message = `${trade.buyer.username} accepted the trade, waiting for seller to accept.`;
      }
    } else if (isSeller && !trade.sellerAccepted) {
      trade.sellerAccepted = true;
      trade.sellerAcceptedAt = new Date();
      
      if (trade.buyerAccepted) {
        newStatus = 'both_accepted';
        message = 'Both parties accepted. Trade will be completed.';
      } else {
        newStatus = 'seller_accepted';
        message = `${trade.seller.username} accepted the trade, waiting for buyer to accept.`;
      }
    } else {
      return res.status(400).json({ error: 'You have already accepted this trade' });
    }

    trade.status = newStatus;
    await trade.save();

    // Si ambos aceptaron, completar el trade
    if (newStatus === 'both_accepted') {
      await completeTrade(trade);
    }

    return res.status(200).json({
      trade,
      message
    });

  } catch (error) {
    console.error('Error accepting trade:', error);
    return res.status(500).json({ error: 'Error accepting trade' });
  }
};

// Rechazar trade
const rejectTrade = async (req, res) => {
  try {
    const { tradeId } = req.params;
    const userId = req.user.id;

    const trade = await Trade.findOne({
      where: {
        id: tradeId,
        [Op.or]: [
          { buyerId: userId },
          { sellerId: userId }
        ],
        status: ['pending', 'buyer_accepted', 'seller_accepted']
      },
      include: [
        { model: User, as: 'buyer' },
        { model: User, as: 'seller' },
        { model: Chat }
      ]
    });

    if (!trade) {
      return res.status(404).json({ error: 'Trade not found or cannot be rejected' });
    }

    const chatId = trade.chatId;
    const rejectorName = userId === trade.buyerId ? trade.buyer.username : trade.seller.username;

    // Primero actualizar trade como rechazado
    trade.status = 'rejected';
    trade.rejectedAt = new Date();
    trade.rejectedBy = userId;
    await trade.save();

    // Luego eliminar el chat completamente (esto eliminará automáticamente mensajes y trades asociados)
    const deletedRowsCount = await Chat.destroy({
      where: { id: chatId },
      force: true // Forzar eliminación completa
    });

    console.log(`Trade ${trade.id} rejected by user ${userId} (${rejectorName}). Chat ${chatId} deleted. Rows affected: ${deletedRowsCount}`);

    return res.status(200).json({
      trade,
      chatDeleted: true,
      message: `Trade rejected by ${rejectorName}. Chat has been deleted.`
    });

  } catch (error) {
    console.error('Error rejecting trade:', error);
    return res.status(500).json({ error: 'Error rejecting trade' });
  }
};

// Función auxiliar para completar el trade
const completeTrade = async (trade) => {
  try {
    console.log('Starting trade completion for trade:', trade.id);
    console.log('Trade details:', {
      tradeId: trade.id,
      buyerId: trade.buyerId,
      sellerId: trade.sellerId,
      marketId: trade.marketId,
      hasMarketRelation: !!trade.Market,
      hasCardRelation: !!trade.Market?.Card
    });

    // Actualizar estado del trade
    trade.status = 'completed';
    trade.completedAt = new Date();
    await trade.save();
    console.log('Trade status updated to completed');

    // Obtener la carta a transferir
    let cardId;
    if (trade.Market && trade.Market.Card) {
      // Si tenemos la relación cargada, usar el cardId de ahí
      cardId = trade.Market.Card.id;
      console.log('Card ID from loaded relation:', cardId);
    } else {
      // Si no tenemos la relación cargada, buscar el market
      const market = await Market.findByPk(trade.marketId, {
        include: [{ model: Card }]
      });
      if (market && market.Card) {
        cardId = market.Card.id;
        console.log('Card ID from market lookup:', cardId);
      } else {
        throw new Error(`Market ${trade.marketId} or Card not found`);
      }
    }

    // Transferir la carta del seller al buyer
    if (cardId) {
      const card = await Card.findByPk(cardId);
      if (card) {
        const oldOwnerId = card.userId;
        card.userId = trade.buyerId;
        card.isListed = false; // Desmarcar como listada ya que se vendió
        card.price = null; // Limpiar el precio
        await card.save();
        console.log(`Card ${cardId} transferred from user ${oldOwnerId} to user ${trade.buyerId}`);
      } else {
        throw new Error(`Card ${cardId} not found`);
      }
    } else {
      throw new Error('Card ID not found for trade');
    }

    // Actualizar estado del market listing
    const market = await Market.findByPk(trade.marketId);
    if (market) {
      market.status = 'sold';
      await market.save();
      console.log('Market listing updated to sold');
    } else {
      console.warn(`Market ${trade.marketId} not found for status update`);
    }

    // Eliminar el chat completamente
    const chatId = trade.chatId;
    const deletedRowsCount = await Chat.destroy({
      where: { id: chatId },
      force: true // Forzar eliminación completa
    });

    console.log(`Trade ${trade.id} completed successfully. Card ${cardId} transferred from user ${trade.sellerId} to user ${trade.buyerId}. Chat ${chatId} deleted. Rows affected: ${deletedRowsCount}`);

    return { success: true, chatDeleted: true };

  } catch (error) {
    console.error('Error completing trade:', error);
    console.error('Trade object:', JSON.stringify(trade, null, 2));
    throw error;
  }
};

// Obtener trade activo de un chat
const getChatTrade = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    // Verificar que el usuario es parte del chat
    const chat = await Chat.findOne({
      where: {
        id: chatId,
        [Op.or]: [
          { userId1: userId },
          { userId2: userId }
        ]
      }
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found or access denied' });
    }

    const trade = await Trade.findOne({
      where: {
        chatId,
        status: ['pending', 'buyer_accepted', 'seller_accepted', 'both_accepted']
      },
      include: [
        { model: User, as: 'buyer' },
        { model: User, as: 'seller' },
        { model: Market, include: [{ model: Card }] }
      ]
    });

    return res.status(200).json({ trade });

  } catch (error) {
    console.error('Error getting chat trade:', error);
    return res.status(500).json({ error: 'Error getting trade information' });
  }
};

module.exports = {
  initiateTrade,
  acceptTrade,
  rejectTrade,
  getChatTrade
}; 