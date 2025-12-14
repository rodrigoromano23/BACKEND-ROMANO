import express from "express";
import User from "../models/User.js";
import { authenticate, authorizeRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// ===============================
// 👥 OBTENER EMPLEADOS (solo jefe)
// ===============================
router.get(
  "/users",
  authenticate,
  authorizeRole("jefe"),
  async (req, res) => {
    try {
      const empleados = await User.find({ rol: "empleado" }).select("-claveHash");
      res.json(empleados);
    } catch (err) {
      console.error("ERROR GET EMPLEADOS:", err);
      res.status(500).json({ msg: "Error al obtener empleados" });
    }
  }
);

// =====================================
// ❌ ELIMINAR USUARIO
// - jefe puede:
//   ✔ eliminar empleados
//   ✔ eliminarse a sí mismo
// =====================================
router.delete(
  "/users/:id",
  authenticate,
  authorizeRole("jefe"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const userToDelete = await User.findById(id);
      if (!userToDelete) {
        return res.status(404).json({ msg: "Usuario no encontrado" });
      }

      // seguridad extra (no permitir borrar otro jefe)
      if (userToDelete.rol === "jefe" && String(req.user._id) !== String(id)) {
        return res.status(403).json({
          msg: "No puedes eliminar a otro jefe",
        });
      }

      await User.findByIdAndDelete(id);
      res.json({ msg: "Usuario eliminado correctamente" });
    } catch (err) {
      console.error("ERROR DELETE USER:", err);
      res.status(500).json({ msg: "Error al eliminar usuario" });
    }
  }
);

export default router;


