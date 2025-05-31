# 🃏 Magic Cards Trading Platform

Una plataforma completa para la compra, venta e intercambio de cartas Magic The Gathering con funcionalidades de chat en tiempo real y sistema de trading seguro.

![Platform Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Docker](https://img.shields.io/badge/Docker-Supported-blue)
![Angular](https://img.shields.io/badge/Angular-19-red)
![Node.js](https://img.shields.io/badge/Node.js-20+-green)

## 📋 Índice

- [Características](#-características)
- [Arquitectura](#-arquitectura)
- [Tecnologías](#-tecnologías)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [API Documentation](#-api-documentation)
- [Desarrollo](#-desarrollo)
- [Testing](#-testing)
- [Contribución](#-contribución)
- [Licencia](#-licencia)

## ✨ Características

### 🔐 Autenticación y Seguridad
- Sistema completo de autenticación con JWT
- Gestión de sesiones con expiración automática
- Protección de rutas y endpoints
- Encriptación de contraseñas con bcrypt

### 🎴 Gestión de Cartas
- **Colección Personal**: Agregar, editar y eliminar cartas
- **Subida de Imágenes**: Sistema seguro de carga de archivos
- **Validaciones**: Control de condición y metadatos
- **Búsqueda Avanzada**: Filtros por nombre, edición y condición

### 🛒 Marketplace
- **Listados de Venta**: Publicar cartas en el mercado
- **Búsqueda y Filtros**: Encontrar cartas específicas
- **Precios Competitivos**: Sistema de ofertas
- **Estados de Listado**: Activo, vendido, retirado

### 💬 Chat 
- **Notificaciones**: Contadores de mensajes no leídos
- **Historial**: Persistencia de conversaciones
- **Estados de Lectura**: Seguimiento de mensajes leídos

### 🔄 Sistema de Trading
- **Propuestas de Intercambio**: Iniciación por compradores
- **Doble Confirmación**: Seguridad con aceptación mutua
- **Transferencia Automática**: Cambio de propietario al completar
- **Gestión de Estados**: Seguimiento completo del proceso

### 🎨 Interfaz de Usuario
- **Diseño Moderno**: Tailwind CSS responsive
- **Modo Oscuro**: Soporte completo de temas
- **Modales Elegantes**: Sistema personalizado de notificaciones
- **UX Optimizada**: Navegación intuitiva y fluida

## 🏗️ Arquitectura

### Estructura del Proyecto
```
TFG-master/
├── backend/                 # API RESTful con Node.js
│   ├── src/
│   │   ├── controllers/     # Lógica de negocio
│   │   │   ├── controllers/     # Lógica de negocio
│   │   │   ├── models/          # Modelos de base de datos
│   │   │   ├── routes/          # Definición de endpoints
│   │   │   ├── middlewares/     # Autenticación y validaciones
│   │   │   ├── config/          # Configuración de BD y JWT
│   │   │   └── utils/           # Utilidades y validadores
│   │   ├── uploads/             # Almacenamiento de imágenes
│   │   └── server.js            # Punto de entrada del servidor
├── frontend/                # Aplicación Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/  # Componentes reutilizables
│   │   │   ├── pages/       # Páginas de la aplicación
│   │   │   ├── services/    # Servicios HTTP y lógica
│   │   │   ├── models/      # Interfaces TypeScript
│   │   │   ├── guards/      # Protección de rutas
│   │   │   └── interceptors/# Interceptores HTTP
│   │   └── environments/    # Configuración de entornos
└── docker-compose.yml       # Orquestación de servicios
```

### Flujo de Datos
```
Frontend (Angular) ↔ HTTP/WebSocket ↔ Backend (Express) ↔ PostgreSQL
                                     ↓
                              Socket.io Server ↔ Real-time Chat
```

## 🛠️ Tecnologías

### Backend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Node.js | 20+ | Runtime de JavaScript |
| Express.js | 4.21+ | Framework web |
| PostgreSQL | 17+ | Base de datos relacional |
| Sequelize | 6.37+ | ORM para PostgreSQL |
| JWT | 9.0+ | Autenticación |
| Multer | 1.4+ | Carga de archivos |
| bcrypt | 5.1+ | Encriptación de contraseñas |

### Frontend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Angular | 19+ | Framework frontend |
| TypeScript | 5.7+ | Lenguaje tipado |
| Tailwind CSS | 3.4+ | Framework de estilos |

### DevOps & Tools
| Tecnología | Propósito |
|------------|-----------|
| Docker | Contenedorización |
| Docker Compose | Orquestación local |
| Nginx | Servidor web (producción) |

## 🚀 Instalación

### Prerrequisitos
- Docker y Docker Compose
- Node.js 20+ (para desarrollo local)
- PostgreSQL 17+ (para desarrollo local)

### Método 1: Docker (Recomendado)

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd TFG-master
```

2. **Iniciar con Docker Compose**
```bash
docker-compose up -d
```

3. **Acceder a la aplicación**
- Frontend: http://localhost
- Backend API: http://localhost:3000
- Base de datos: localhost:5432

### Método 2: Desarrollo Local

#### Backend
```bash
cd backend
npm install
cp .env.example .env
# Configurar variables de entorno
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
ng serve
```

## ⚙️ Configuración

### Variables de Entorno (.env)
```env
# Servidor
PORT=3000
NODE_ENV=development

# Base de Datos PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tfg_magic
DB_USER=postgres
DB_PASSWORD=postgres

# Autenticación JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h

# Uploads
UPLOAD_PATH=uploads
MAX_FILE_SIZE=5242880
ALLOWED_EXTENSIONS=jpg,jpeg,png,gif

# CORS
CORS_ORIGIN=http://localhost:4200
```

### Configuración del Frontend (environment.ts)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  socketUrl: 'http://localhost:3000'
};
```

## 📖 Uso

### 1. Registro e Inicio de Sesión
- Crear cuenta con email único
- Iniciar sesión con credenciales
- Gestión automática de sesiones JWT

### 2. Gestionar Colección
- Agregar cartas con imágenes
- Editar detalles y condición
- Eliminar cartas de la colección

### 3. Marketplace
- Publicar cartas para venta
- Buscar cartas específicas
- Contactar vendedores via chat

### 4. Sistema de Trading
- Iniciar propuesta desde chat
- Ambas partes deben aceptar
- Transferencia automática al completar

### 5. Chat en Tiempo Real
- Comunicación instantánea
- Notificaciones de mensajes
- Historial completo

## 📚 API Documentation

### Endpoints Principales

#### Autenticación
```
POST /api/auth/register     # Registro de usuario
POST /api/auth/login        # Inicio de sesión
GET  /api/auth/profile      # Perfil del usuario
PUT  /api/auth/profile      # Actualizar perfil
PUT  /api/auth/password     # Cambiar contraseña
```

#### Cartas
```
GET    /api/cards           # Listar cartas del usuario
POST   /api/cards           # Crear nueva carta
GET    /api/cards/:id       # Obtener carta específica
PUT    /api/cards/:id       # Actualizar carta
DELETE /api/cards/:id       # Eliminar carta
```

#### Marketplace
```
GET  /api/market            # Listar cartas en venta
GET  /api/market/:id        # Detalle de listado
POST /api/market            # Crear listado
PUT  /api/market/:id        # Actualizar listado
DELETE /api/market/:id      # Eliminar listado
```

#### Chat
```
GET  /api/chat              # Chats del usuario
POST /api/chat              # Crear chat
GET  /api/chat/:id/messages # Mensajes del chat
POST /api/chat/:id/messages # Enviar mensaje
PUT  /api/chat/:id/read     # Marcar como leído
```

#### Trading
```
GET  /api/trade/chat/:id    # Trade activo del chat
POST /api/trade/chat/:id/initiate # Iniciar trade
PUT  /api/trade/:id/accept  # Aceptar trade
PUT  /api/trade/:id/reject  # Rechazar trade
```

## 🔧 Desarrollo

### Scripts Disponibles

#### Backend
```bash
npm run dev         # Desarrollo con nodemon
npm start           # Producción
npm run test        # Tests unitarios
```

#### Frontend
```bash
ng serve            # Servidor de desarrollo
ng build            # Build de producción
ng test             # Tests unitarios
ng e2e              # Tests end-to-end
ng generate         # Generar componentes
```

### Estructura de Commits
```
type(scope): description

feat(auth): add JWT refresh token functionality
fix(chat): resolve message ordering issue
docs(readme): update installation instructions
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test            # Ejecutar tests
npm run test:watch  # Tests en modo watch
npm run test:coverage # Coverage report
```

### Frontend Tests
```bash
cd frontend
ng test             # Tests unitarios
ng e2e              # Tests end-to-end
```

## 🤝 Contribución

1. Fork del proyecto
2. Crear branch para feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit cambios (`git commit -m 'feat: agregar nueva característica'`)
4. Push al branch (`git push origin feature/nueva-caracteristica`)
5. Crear Pull Request

### Guías de Contribución
- Seguir convenciones de código establecidas
- Incluir tests para nuevas funcionalidades
- Documentar cambios significativos
- Mantener cobertura de tests > 80%

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

## 👨‍💻 Autor

Desarrollado como proyecto de Trabajo de Fin de Grado (TFG).

## 🔗 Enlaces Útiles

- [Angular Documentation](https://angular.dev)
- [Express.js Guide](https://expressjs.com)
- [Socket.io Documentation](https://socket.io/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [PostgreSQL Docs](https://www.postgresql.org/docs)

---

<p align="center">
  <i>🃏 Hecho con ❤️ para la comunidad de Magic The Gathering</i>
</p> 