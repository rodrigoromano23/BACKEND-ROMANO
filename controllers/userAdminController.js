/*import User from "../models/User.js";

export const listUsers = async (req,res,next) => {
  try {
    const users = await User.find({ rol: "empleado" }).select("-claveHash").sort({ nombre:1 });
    res.json(users);
  } catch(err){ next(err); }
};

export const deleteUserById = async (req,res,next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: "Usuario eliminado" });
  } catch(err){ next(err); }
};*/

//NUEVO CON SEGURIDAD

// controllers/userController.js

import mongoose from "mongoose";
import User from "../models/User.js";

// =========================
//  LISTAR EMPLEADOS
// =========================
export const listUsers = async (req, res, next) => {
  try {
    const users = await User.find({ rol: "empleado" })
      .select("-claveHash")
      .sort({ nombre: 1 });

    return res.json(users);
  } catch (err) {
    next(err);
  }
};

// =========================
//  ELIMINAR USUARIO POR ID
// =========================
export const deleteUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validación: ID válido de Mongo
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "ID de usuario inválido" });
    }

    // Buscar usuario
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    // No permitir borrar un Jefe desde rutas de empleados
    if (user.rol === "jefe") {
      return res.status(403).json({
        msg: "No puedes eliminar usuarios con rol Jefe"
      });
    }

    // Eliminar usuario
    await User.findByIdAndDelete(id);

    return res.json({ msg: "Usuario eliminado correctamente" });
  } catch (err) {
    next(err);
  }
};

