

import multer from "multer";

const storage = multer.memoryStorage();

export const uploadCarousel = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB por imagen
}).array("imagenes", 10); // hasta 10 imágenes



