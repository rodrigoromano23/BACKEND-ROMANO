import multer from 'multer';

// Configuración de Multer para almacenar los archivos en memoria (buffer)
const storage = multer.memoryStorage();  
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },  
  fileFilter: (req, file, cb) => {
    // Filtrar solo imágenes
    const fileTypes = /jpeg|jpg|png|gif/;
    const mimetype = fileTypes.test(file.mimetype);
    if (mimetype) {
      return cb(null, true);
    }
    return cb(new Error('Tipo de archivo no permitido'), false);
  }
});

export default upload;

