import User from "../models/User.js";

export const listEmployees = async (req, res) => {
  try {
    // listar todos los usuarios con rol empleado
    const empleados = await User.find({ rol: "empleado" }).select("-claveHash");
    return res.json({ empleados });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const empleado = await User.findById(id);
    if (!empleado) return res.status(404).json({ message: "Empleado no encontrado" });
    if (empleado.rol === "jefe") return res.status(403).json({ message: "No se puede eliminar a un jefe" });

    await empleado.remove();
    return res.json({ message: "Empleado eliminado" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
