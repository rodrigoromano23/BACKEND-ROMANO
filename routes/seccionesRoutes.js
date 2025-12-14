import { Router } from "express";
import multer from "multer";
import { 
  createSeccion, 
  getSecciones, 
  getSeccionBySlug, 
  deleteSeccion 
} from "../controllers/seccionesController.js";

import { authenticate, authorizeRole } from "../middleware/authMiddleware.js";

const router = Router();
const upload = multer({ dest: "uploads/" });

// Crear sección — jefe o empleado
router.post(
  "/",
  authenticate,
  authorizeRole(["jefe", "empleado"]),
  upload.array("media"),
  createSeccion
);

// Listar TODAS las secciones (uso interno)
router.get("/", getSecciones);

// Listar SOLO públicas (uso para frontend visitantes)
router.get(
  "/public",
  (req, res, next) => {
    req.query.publicOnly = "true";
    next();
  },
  getSecciones
);

// Traer sección por slug — público
router.get("/slug/:slug", getSeccionBySlug);

// Borrar sección — solo jefe
router.delete(
  "/:id",
  authenticate,
  authorizeRole(["jefe"]),
  deleteSeccion
);



export default router;

