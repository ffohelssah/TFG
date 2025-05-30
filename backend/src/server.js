// ================================================================================================
// SERVIDOR PRINCIPAL BACKEND - MAGIC CARDS TRADING APPLICATION
// ================================================================================================
// Este archivo configura y ejecuta el servidor Node.js/Express principal que actúa como:
// 1. API REST para todas las operaciones CRUD
// 2. Servidor WebSocket para chat en tiempo real
// 3. Servidor de archivos estáticos (imágenes de cartas)
// 4. Punto de entrada y configuración de la aplicación backend
// ================================================================================================

// ============================================================================================
// IMPORTACIONES DE DEPENDENCIAS
// ============================================================================================
const express = require('express');        // Framework web para Node.js
const http = require('http');               // Módulo HTTP nativo para crear servidor
const { Server } = require('socket.io');   // Librería para WebSockets en tiempo real
const cors = require('cors');               // Middleware para Cross-Origin Resource Sharing
const path = require('path');               // Utilidades para rutas de archivos
const dotenv = require('dotenv');           // Carga variables de entorno desde .env
const { sequelize } = require('./config/database'); // Configuración de base de datos

// ============================================================================================
// CONFIGURACIÓN INICIAL
// ============================================================================================
// Cargar variables de entorno desde archivo .env
dotenv.config();

// Inicializar aplicación Express y servidor HTTP
const app = express();
const server = http.createServer(app);

// ============================================================================================
// CONFIGURACIÓN DE MIDDLEWARES
// ============================================================================================
// Configurar CORS - permite peticiones desde cualquier origen (frontend)
app.use(cors());

// Parsear JSON y datos de formularios en el cuerpo de las peticiones
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================================================================
// CONFIGURACIÓN DE ARCHIVOS ESTÁTICOS
// ============================================================================================
// Servir archivos de uploads (imágenes de cartas) como contenido estático
app.use('/uploads', express.static(path.join(__dirname, '..', process.env.UPLOAD_PATH || 'uploads')));

// Crear directorio de uploads si no existe (importante para primera ejecución)
const fs = require('fs');
const uploadDir = path.join(__dirname, '..', process.env.UPLOAD_PATH || 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ============================================================================================
// CONFIGURACIÓN DE RUTAS API
// ============================================================================================
// Importar todos los módulos de rutas organizados por funcionalidad
const authRoutes = require('./routes/auth.routes');     // Autenticación y autorización
const cardRoutes = require('./routes/card.routes');     // Gestión de cartas del usuario
const marketRoutes = require('./routes/market.routes'); // Mercado y listados de cartas
const userRoutes = require('./routes/user.routes');     // Gestión de perfiles de usuario
const chatRoutes = require('./routes/chat.routes');     // Sistema de mensajería
const tradeRoutes = require('./routes/trade.routes');   // Sistema de intercambios

// Montar las rutas con sus prefijos correspondientes
app.use('/api/auth', authRoutes);     // /api/auth/* - Login, registro, refresh tokens
app.use('/api/cards', cardRoutes);    // /api/cards/* - CRUD de cartas personales
app.use('/api/market', marketRoutes); // /api/market/* - Listados públicos y compras
app.use('/api/users', userRoutes);    // /api/users/* - Perfiles y configuración
app.use('/api/chat', chatRoutes);     // /api/chat/* - Conversaciones y mensajes
app.use('/api/trade', tradeRoutes);   // /api/trade/* - Propuestas e intercambios

// ============================================================================================
// RUTA RAÍZ - HEALTH CHECK
// ============================================================================================
// Ruta de prueba para verificar que el servidor está funcionando
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenido a la API de Magic Cards' });
});

// ============================================================================================
// CONFIGURACIÓN DE WEBSOCKETS (SOCKET.IO)
// ============================================================================================
// Configurar Socket.io para comunicación en tiempo real (chat)
const io = new Server(server, {
  cors: {
    origin: '*',                  // Permitir conexiones desde cualquier origen
    methods: ['GET', 'POST']      // Métodos HTTP permitidos
  }
});

// ============================================================================================
// MANEJADORES DE EVENTOS WEBSOCKET
// ============================================================================================
// Manejar conexiones de websocket para el sistema de chat en tiempo real
io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);

  // Evento: Usuario se une a una sala de chat específica
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`Usuario ${socket.id} unido a la sala ${roomId}`);
  });

  // Evento: Enviar mensaje a todos los usuarios en la sala
  socket.on('send_message', (data) => {
    socket.to(data.room).emit('receive_message', data);
  });

  // Evento: Usuario se desconecta
  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
  });
});

// ============================================================================================
// CONFIGURACIÓN DE PUERTO
// ============================================================================================
// Puerto del servidor (por defecto 3000, configurable via variable de entorno)
const PORT = process.env.PORT || 3000;

// ============================================================================================
// INICIALIZACIÓN DEL SERVIDOR
// ============================================================================================
// Función asíncrona para inicializar servidor con sincronización de BD
const startServer = async () => {
  try {
    // Sincronizar modelos con la base de datos (crear/actualizar tablas)
    await sequelize.sync({ alter: true });
    console.log('Base de datos sincronizada correctamente');

    // Iniciar servidor HTTP en el puerto especificado
    server.listen(PORT, () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
    });
  } catch (error) {
    console.error('Error al sincronizar la base de datos:', error);
  }
};

// Ejecutar la inicialización del servidor
startServer(); 