# Magic Cards Trading Platform

Este proyecto es una plataforma para la compra, venta e intercambio de cartas Magic The Gathering, con funcionalidades de chat en tiempo real.

## Estructura del proyecto

El proyecto está dividido en dos partes principales:

1. **Backend**: API RESTful desarrollada con Node.js, Express y PostgreSQL
2. **Frontend**: Aplicación web desarrollada con Angular y Tailwind CSS

## Tecnologías utilizadas

### Backend
- Node.js y Express
- PostgreSQL con Sequelize ORM
- Socket.io para comunicación en tiempo real
- JWT para autenticación
- Multer para gestión de subida de archivos

### Frontend
- Angular (último)
- Tailwind CSS para estilos
- Socket.io-client para comunicación en tiempo real

## Características principales

- **Autenticación y gestión de usuarios**
- **Gestión de cartas**:
  - Añadir/editar/eliminar cartas a tu colección
  - Subir imágenes de las cartas
- **Mercado de cartas**:
  - Listar cartas para vender
  - Buscar y comprar cartas
  - Filtrado por diferentes criterios
- **Sistema de chat en tiempo real**:
  - Comunicación entre compradores y vendedores
  - Notificaciones
  - Historial de mensajes

## Instalación y ejecución

### Con Docker (recomendado)

1. Asegúrate de tener Docker y Docker Compose instalados
2. Clona este repositorio
3. Ejecuta el siguiente comando en la raíz del proyecto:

```bash
docker-compose up
```

La aplicación estará disponible en:
- Frontend: http://localhost
- Backend API: http://localhost:3000/api
- Documentación API: http://localhost:3000/api-docs (si está disponible)

### Desarrollo local

#### Backend:

```bash
cd backend
npm install
npm run dev
```

#### Frontend:

```bash
cd frontend
npm install
ng serve
```

## Configuración

### Variables de entorno

El backend utiliza un archivo `.env` para configuración. Puedes copiar el archivo `.env.example` y modificarlo según tus necesidades:

```
# Puerto del servidor
PORT=3000
NODE_ENV=development

# Configuración de la base de datos PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tfg_magic
DB_USER=postgres
DB_PASSWORD=postgres

# Configuración de JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h

# Configuración de uploads
UPLOAD_PATH=uploads
```

## Documentación

Si deseas más información sobre la API, consulta la documentación adicional en la carpeta `/docs` (si está disponible).

## Autores

Desarrollado como proyecto de TFG.

## Licencia

Este proyecto está bajo la Licencia MIT. 