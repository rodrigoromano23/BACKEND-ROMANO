import express from "express";
import multer from "multer";
import {
  crearPublicacionCanvas,
  crearPublicacionTexto,
  crearPublicacionVideo,
  crearPublicacionCarrusel,
  obtenerPorSeccion,
  obtenerInicioActual,
  obtenerTodasPublicaciones,
  eliminarPublicacion
} from "../controllers/editorController.js";


const router = express.Router();

// Multer en memoria (compatible con Render)
const storage = multer.memoryStorage();
const upload = multer({ storage });

/* ======================= CREAR ===================== */

router.post("/canvas", crearPublicacionCanvas);
router.post("/texto", crearPublicacionTexto);
router.post("/video", crearPublicacionVideo);
router.post("/carrusel", upload.array("images"), crearPublicacionCarrusel);

/* ===================== LISTAR ====================== */

router.get("/section/:section", obtenerPorSeccion);
router.get("/inicio", obtenerInicioActual);

/* ===================== ELIMINAR ===================== */

router.delete("/:tipo/:id", eliminarPublicacion);

/*=================== TRAER TODO PARA ELIMINAR==========================*/
router.get("/todas", obtenerTodasPublicaciones);


export default router;





