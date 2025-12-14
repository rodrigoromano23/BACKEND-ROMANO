import { Router } from "express";
import { authenticate, authorizeRole } from "../middlewares/authMiddleware.js";
import { listEmployees, deleteEmployee } from "../controllers/employeeController.js";

const router = Router();

// solo JEFES pueden ver y eliminar empleados
router.get("/", authenticate, authorizeRole("jefe"), listEmployees);
router.delete("/:id", authenticate, authorizeRole("jefe"), deleteEmployee);

export default router;
