// ================================================================================================
// MIDDLEWARE DE SUBIDA DE ARCHIVOS - UPLOAD MIDDLEWARE
// ================================================================================================
// Este middleware gestiona la subida segura de archivos al servidor usando Multer:
// 1. Configuración de almacenamiento en disco
// 2. Generación de nombres únicos para archivos
// 3. Filtrado y validación de tipos de archivo
// 4. Control de límites de tamaño
// 5. Manejo centralizado de errores
// 
// CARACTERÍSTICAS DE SEGURIDAD:
// - Solo acepta imágenes (jpeg, jpg, png, gif, webp)
// - Límite de 5MB por archivo
// - Nombres únicos para prevenir colisiones
// - Validación de MIME type y extensión
// ================================================================================================

// ============================================================================================
// IMPORTACIONES
// ============================================================================================
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

// ============================================================================================
// CONFIGURACIÓN DE DIRECTORIO
// ============================================================================================
// Configurar directorio de subida usando variable de entorno
// Creación automática si no existe
const UPLOAD_PATH = path.join(__dirname, '../../', process.env.UPLOAD_PATH || 'uploads');

// Asegurar que existe el directorio
if (!fs.existsSync(UPLOAD_PATH)) {
  fs.mkdirSync(UPLOAD_PATH, { recursive: true });
}

// ============================================================================================
// CONFIGURACIÓN DE ALMACENAMIENTO
// ============================================================================================
// Multer DiskStorage para guardar archivos en servidor
// Generación de nombres únicos usando timestamp + random
// Formato: card-{timestamp}-{random}.{extension}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_PATH);
  },
  filename: (req, file, cb) => {
    // Generar nombre único para la imagen
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExt = path.extname(file.originalname);
    cb(null, `card-${uniqueSuffix}${fileExt}`);
  }
});

// ============================================================================================
// FILTRO DE TIPOS DE ARCHIVO
// ============================================================================================
// Validación doble: extensión de archivo y MIME type
// Tipos permitidos: jpeg, jpg, png, gif, webp
// Rechazo automático de otros tipos de archivo
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Sólo se permiten archivos de imagen (jpeg, jpg, png, gif, webp)'));
  }
};

// ============================================================================================
// CONFIGURACIÓN PRINCIPAL DE MULTER
// ============================================================================================
// Límites: 5MB máximo por archivo
// Storage: Configuración de disco definida arriba
// FileFilter: Validación de tipos aplicada
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB límite
  },
  fileFilter: fileFilter
});

// ============================================================================================
// MANEJO DE ERRORES DE MULTER
// ============================================================================================
// Middleware especializado para errores de subida
// Casos específicos: Límite de tamaño, tipos no válidos
// Respuestas descriptivas para debugging y UX
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'El archivo excede el tamaño máximo permitido (5MB)' });
    }
    return res.status(400).json({ error: `Error en la subida de archivo: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};

module.exports = {
  upload,
  handleUploadError
}; 