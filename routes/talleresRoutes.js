import { Router } from "express";
import { createTaller, getTalleres, deleteTaller } from "../controllers/talleresController.js";
import { authenticate, authorizeRole } from "../middleware/authMiddleware.js";

const router = Router();

// Crear taller — permitido para jefe y empleado
router.post(
  "/",
  authenticate,
  authorizeRole(["jefe", "empleado"]),
  createTaller
);

// Listar talleres — público
router.get("/", getTalleres);

// Eliminar taller — solo jefe
router.delete(
  "/:id",
  authenticate,
  authorizeRole(["jefe"]),
  deleteTaller
);

export default router;


