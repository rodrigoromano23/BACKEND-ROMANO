/*import { Router } from "express";
import {
  createInscripto,
  getInscriptos,
  exportInscriptos,
  deleteInscripto
} from "../controllers/inscriptosController.js";

import { authenticate, authorizeRole } from "../middleware/authMiddleware.js";

const router = Router();

// Ruta pública
router.post("/", createInscripto);

// Listar inscriptos — requiere rol
router.get(
  "/",
  authenticate,
  authorizeRole(["jefe", "empleado"]),
  getInscriptos
);

// Exportar a Excel
router.get(
  "/export",
  authenticate,
  authorizeRole(["jefe", "empleado"]),
  exportInscriptos
);

// Eliminar inscripto — solo jefe
router.delete(
  "/:id",
  authenticate,
  authorizeRole(["jefe"]),
  deleteInscripto
);

router.delete("/clear", authMiddleware, async (req, res) => {
  try {
    await Inscriptos.deleteMany({});
    res.json({ msg: "Lista de inscriptos eliminada correctamente" });
  } catch (err) {
    console.error("Error al limpiar inscriptos:", err);
    res.status(500).json({ msg: "Error al limpiar inscriptos" });
  }
});

export default router;*/

import { Router } from "express";
import {
  createInscripto,
  getInscriptos,
  exportInscriptos,
  deleteInscripto,
  clearInscriptos,
  deleteInscriptoByDni
} from "../controllers/inscriptosController.js";

import { authenticate, authorizeRole } from "../middleware/authMiddleware.js";

const router = Router();

// Crear inscripto (público)
router.post("/", createInscripto);

// Listar inscriptos
router.get(
  "/",
  authenticate,
  authorizeRole(["jefe", "empleado"]),
  getInscriptos
);

// Exportar a Excel
router.get(
  "/export",
  authenticate,
  authorizeRole(["jefe", "empleado"]),
  exportInscriptos
);

// Eliminar 1 inscripto
router.delete(
  "/:id",
  authenticate,
  authorizeRole(["jefe", "empleado"]),
  deleteInscripto
);

// Limpiar TODOS los inscriptos
router.delete(
  "/clear",
  authenticate,
  authorizeRole(["jefe", "empleado"]),
  clearInscriptos
);

//elimina por dni
router.delete("/dni/:dni", deleteInscriptoByDni);


export default router;




