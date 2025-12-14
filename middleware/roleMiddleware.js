

export default function roleMiddleware(rolesPermitidos = []) {
  return (req, res, next) => {
    try {
      // VALIDACIÓN 1: rolesPermitidos debe ser un array y no estar vacío
      if (!Array.isArray(rolesPermitidos)) {
        return res.status(500).json({
          msg: "Configuración interna inválida: rolesPermitidos debe ser un array"
        });
      }

      if (rolesPermitidos.length === 0) {
        return res.status(500).json({
          msg: "Configuración inválida: se debe especificar al menos un rol permitido"
        });
      }

      // VALIDACIÓN 2: req.user debe existir (ya cargado por authMiddleware)
      if (!req.user) {
        return res.status(401).json({ msg: "Usuario no autenticado" });
      }

      // VALIDACIÓN 3: El usuario debe tener un rol válido
      if (!req.user.rol || typeof req.user.rol !== "string") {
        return res.status(400).json({ msg: "Usuario sin rol asignado o rol inválido" });
      }

      const rolUsuario = req.user.rol;

      // VALIDACIÓN 4: El rol del usuario debe estar permitido
      if (!rolesPermitidos.includes(rolUsuario)) {
        return res.status(403).json({ msg: "No tienes permisos para esta acción" });
      }

      next(); // Todo correcto
    } catch (err) {
      console.error("Error en roleMiddleware:", err);
      next(err);
    }
  };
}


