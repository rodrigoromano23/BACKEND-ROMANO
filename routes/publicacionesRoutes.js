import express from "express";
import {
  crearPublicacion,
  obtenerPorSeccion,
  obtenerActualInicio,
  eliminarPublicacion
} from "../controllers/publicacionController.js";
import { uploadCarousel } from "../middlewares/upload.js";

const router = express.Router();

// Crear / publicar
router.post("/", crearPublicacion);

// Obtener por sección (para vistas públicas)
router.get("/", obtenerPorSeccion);

// Obtener últimas publicaciones para inicio
router.get("/inicio", obtenerActualInicio);

// Eliminar publicación
router.delete("/:tipo/:id", eliminarPublicacion);

router.post("/", uploadCarousel, crearPublicacion);

export default router;
