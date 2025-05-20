const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { sequelize } = require('./config/database');

// Cargar variables de entorno
dotenv.config();

// Inicializar Express
const app = express();
const server = http.createServer(app);

// Configurar CORS
app.use(cors());

// Parsear JSON y URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar directorio estático para uploads
app.use('/uploads', express.static(path.join(__dirname, '..', process.env.UPLOAD_PATH || 'uploads')));

// Crear directorio de uploads si no existe
const fs = require('fs');
const uploadDir = path.join(__dirname, '..', process.env.UPLOAD_PATH || 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configurar rutas
const authRoutes = require('./routes/auth.routes');
const cardRoutes = require('./routes/card.routes');
const marketRoutes = require('./routes/market.routes');
const userRoutes = require('./routes/user.routes');
const chatRoutes = require('./routes/chat.routes');

app.use('/api/auth', authRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenido a la API de Magic Cards' });
});

// Configurar Socket.io para chat en tiempo real
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Manejar conexiones de websocket
io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);

  // Unirse a una sala de chat
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`Usuario ${socket.id} unido a la sala ${roomId}`);
  });

  // Escuchar mensajes
  socket.on('send_message', (data) => {
    socket.to(data.room).emit('receive_message', data);
  });

  // Manejar desconexión
  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
  });
});

// Puerto
const PORT = process.env.PORT || 3000;

// Iniciar servidor después de sincronizar la base de datos
const startServer = async () => {
  try {
    // Sincronizar con la base de datos
    await sequelize.sync({ alter: true });
    console.log('Base de datos sincronizada correctamente');

    // Iniciar servidor
    server.listen(PORT, () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
    });
  } catch (error) {
    console.error('Error al sincronizar la base de datos:', error);
  }
};

startServer(); 