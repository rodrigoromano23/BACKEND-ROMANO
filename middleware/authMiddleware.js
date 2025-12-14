/*import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "SECRET_KEY_123";

// Middleware para verificar token y autenticar al usuario
export const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ message: "No token" });

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id).select("-claveHash");
    if (!user) return res.status(401).json({ message: "Usuario no existe" });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token inválido" });
  }
};

// Middleware para autorizar según rol
// roles puede ser un string (un solo rol) o un array de roles
export const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "No autenticado" });

    if (Array.isArray(roles)) {
      if (!roles.includes(req.user.rol)) {
        return res.status(403).json({ message: "Acceso denegado" });
      }
    } else {
      if (req.user.rol !== roles) {
        return res.status(403).json({ message: "Acceso denegado" });
      }
    }

    next();
  };
};*/

//NUEVO CON SEGURIDAD

/*import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "SECRET_KEY_123";

// ===============================
// 🔐 MIDDLEWARE: AUTENTICAR TOKEN
// ===============================
export const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    // Validación: header presente
    if (!header) {
      return res.status(401).json({ message: "Token no enviado" });
    }

    // Validación: Formato correcto "Bearer TOKEN"
    if (!header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Formato de token inválido" });
    }

    const token = header.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Token vacío" });
    }

    // Validación: Decodificar el token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Token inválido o vencido" });
    }

    // Validación: Token debe incluir un ID valido
    if (!decoded.id) {
      return res.status(401).json({ message: "Token corrupto" });
    }

    // Buscar usuario
    const user = await User.findById(decoded.id).select("-claveHash");

    if (!user) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    // Validación: Rol válido según tu backend
    const rolesValidos = ["jefe", "empleado"];
    if (!rolesValidos.includes(user.rol)) {
      return res.status(403).json({
        message: `Rol no permitido: ${user.rol}`,
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(500).json({
      message: "Error en autenticación",
      error: err.message,
    });
  }
};

// ======================================
// 🔐 MIDDLEWARE: AUTORIZAR SEGÚN EL ROL
// ======================================
export const authorizeRole = (rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const rolUsuario = req.user.rol;

    // Si viene un solo rol (string)
    if (typeof rolesPermitidos === "string") {
      if (rolUsuario !== rolesPermitidos) {
        return res.status(403).json({
          message: `Acceso denegado: solo ${rolesPermitidos} puede realizar esta acción`,
        });
      }
      return next();
    }

    // Si viene un array de roles
    if (Array.isArray(rolesPermitidos)) {
      if (!rolesPermitidos.includes(rolUsuario)) {
        return res.status(403).json({
          message: `Acceso denegado: se requiere uno de estos roles: ${rolesPermitidos.join(", ")}`,
        });
      }
      return next();
    }

    // Si rolesPermitidos no es string ni array
    return res.status(500).json({
      message: "Error interno: configuración de roles inválida",
    });
  };
};*/

import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "SECRET_KEY_123"; // Asegúrate de que JWT_SECRET esté en .env

// ===============================
// 🔐 MIDDLEWARE: AUTENTICAR TOKEN
// ===============================
export const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    // Validación: header presente
    if (!header) {
      return res.status(401).json({ message: "Token no enviado" });
    }

    // Validación: Formato correcto "Bearer TOKEN"
    if (!header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Formato de token inválido" });
    }

    const token = header.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Token vacío" });
    }

    // Validación: Decodificar el token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Token inválido o vencido", error: err.message });
    }

    // Validación: Token debe incluir un ID valido
    if (!decoded.id) {
      return res.status(401).json({ message: "Token corrupto" });
    }

    // Buscar usuario
    const user = await User.findById(decoded.id).select("-claveHash");

    if (!user) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    // Validación: Rol válido según tu backend
    const rolesValidos = ["jefe", "empleado"];
    if (!rolesValidos.includes(user.rol)) {
      return res.status(403).json({
        message: `Rol no permitido: ${user.rol}`,
      });
    }

    req.user = user; // Adjuntar el usuario al objeto request
    next(); // Permitir el siguiente middleware o ruta
  } catch (err) {
    return res.status(500).json({
      message: "Error en autenticación",
      error: err.message,
    });
  }
};

// ======================================
// 🔐 MIDDLEWARE: AUTORIZAR SEGÚN EL ROL
// ======================================
export const authorizeRole = (rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const rolUsuario = req.user.rol;

    // Si rolesPermitidos es un string
    if (typeof rolesPermitidos === "string") {
      if (rolUsuario !== rolesPermitidos) {
        return res.status(403).json({
          message: `Acceso denegado: solo ${rolesPermitidos} puede realizar esta acción`,
        });
      }
      return next(); // Permitir el siguiente paso si el rol es válido
    }

    // Si rolesPermitidos es un array
    if (Array.isArray(rolesPermitidos)) {
      if (!rolesPermitidos.includes(rolUsuario)) {
        return res.status(403).json({
          message: `Acceso denegado: se requiere uno de estos roles: ${rolesPermitidos.join(", ")}`,
        });
      }
      return next(); // Permitir el siguiente paso si el rol está en el array
    }

    // Si rolesPermitidos no es ni un string ni un array
    return res.status(500).json({
      message: "Error interno: configuración de roles inválida",
    });
  };
};



