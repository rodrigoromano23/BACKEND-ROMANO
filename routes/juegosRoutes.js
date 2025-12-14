import { Router } from 'express';
import upload from '../middleware/multer.js';
import { crearJuego, obtenerJuegos, eliminarJuego } from '../controllers/juegosController.js';

const router = Router();

// Ruta para crear un juego con la imagen subida a Cloudinary
router.post("/", upload.single('caratula'), crearJuego);

router.get("/", obtenerJuegos);
router.delete("/:id", eliminarJuego);

export default router;



