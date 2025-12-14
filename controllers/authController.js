import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "SECRET_KEY_123";
const RESET_SECRET = process.env.RESET_SECRET || "RESET_SECRET_456"; // distinto al JWT normal

// REGISTER
export const register = async (req, res) => {
  try {
    const {
      nombre, edad, dni, fechaNacimiento,
      domicilio, correo, celular, fotoUrl, clave, rol
    } = req.body;

    if (!correo || !clave || !nombre) {
      return res.status(400).json({ message: "nombre, correo y clave son obligatorios" });
    }

    const exists = await User.findOne({ correo });
    if (exists) return res.status(400).json({ message: "Correo ya registrado" });

    const claveHash = await bcrypt.hash(clave, 10);

    const user = await User.create({
      nombre,
      edad,
      dni,
      fechaNacimiento,
      domicilio,
      correo,
      celular,
      fotoUrl,
      claveHash,
      rol: rol || "empleado"
    });

    // opcional: no devolver el hash
    const safeUser = {
      id: user._id,
      nombre: user.nombre,
      correo: user.correo,
      rol: user.rol
    };

    return res.json({ message: "Usuario creado", user: safeUser });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// LOGIN
// LOGIN — nombre + clave + rol obligatorio
export const login = async (req, res) => {
  try {
    const { nombre, clave, rol } = req.body;

    if (!nombre || !clave || !rol) {
      return res.status(400).json({ message: "Nombre, clave y rol son obligatorios" });
    }

    console.log("BODY LOGIN:", req.body);

    // Buscar usuario por nombre (ya que así lo querés)
    const user = await User.findOne({ nombre });

    console.log("USUARIO ENCONTRADO:", user);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Validar rol
    if (user.rol !== rol) {
      return res.status(403).json({ message: "Rol incorrecto" });
    }

    // Validar clave con hash
    const match = await bcrypt.compare(clave, user.claveHash);
    if (!match) {
      return res.status(400).json({ message: "Clave incorrecta" });
    }

    // Todo OK → generar token
    const token = jwt.sign(
      { id: user._id, rol: user.rol },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const safeUser = {
      id: user._id,
      nombre: user.nombre,
      correo: user.correo,
      rol: user.rol
    };

    return res.json({
      message: "Login exitoso",
      token,
      user: safeUser
    });

  } catch (err) {
    console.error("ERROR LOGIN:", err);
    return res.status(500).json({ error: err.message });
  }
};

// FORGOT — verifica nombre+correo+celular y devuelve token temporal para reset

export const forgotPaso1 = async (req, res) => {
  try {
    const { nombre, correo, celular } = req.body;

    // Log para saber qué datos llegan
    console.log("Datos recibidos en forgotPaso1:", { nombre, correo, celular });

    if (!nombre || !correo || !celular) {
      console.log("Faltan campos requeridos");
      return res.status(400).json({ message: "nombre, correo y celular son requeridos" });
    }

    // Buscar al usuario
    const user = await User.findOne({ nombre, correo, celular });
    if (!user) {
      console.log("Usuario no encontrado");
      return res.status(404).json({ message: "Usuario no encontrado con esos datos" });
    }

    console.log("Usuario encontrado:", user);

    // Generar token para el reset (expira en 10 minutos)
    const resetToken = jwt.sign({ id: user._id }, RESET_SECRET, { expiresIn: "10m" });

    console.log("Token generado:", resetToken);

    // Enviar token (solo se devuelve el token en este paso)
    return res.json({
      message: "Verificado. Usa el token devuelto para ingresar nueva clave.",
      resetToken
    });
  } catch (err) {
    console.error("Error en forgotPaso1:", err);
    return res.status(500).json({ error: err.message });
  }
};


// RESET — recibe { resetToken, nuevaClave }
// RESET — Paso 2: Cambiar la contraseña con el token de reset
export const forgotPaso2 = async (req, res) => {
  try {
    const { token, nuevaClave } = req.body;

    // Log para ver qué datos llegan en este paso
    console.log("Datos recibidos en forgotPaso2:", { token, nuevaClave });

    if (!nuevaClave || nuevaClave.length < 3) {
      console.log("La nueva clave debe tener al menos 3 caracteres");
      return res.status(400).json({ message: "La nueva clave debe tener al menos 3 caracteres" });
    }

    // Verificar el token
    const decoded = jwt.verify(token, RESET_SECRET);
    console.log("Token verificado:", decoded);

    const user = await User.findById(decoded.id);
    if (!user) {
      console.log("Usuario no encontrado en el paso 2");
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    console.log("Usuario encontrado para restablecer contraseña:", user);

    // Encriptar la nueva clave
    const nuevaClaveHash = await bcrypt.hash(nuevaClave, 10);

    // Actualizar la contraseña
    user.claveHash = nuevaClaveHash;
    await user.save();

    console.log("Contraseña actualizada correctamente");

    return res.json({ message: "Contraseña actualizada con éxito" });
  } catch (err) {
    console.error("Error al restablecer la contraseña en forgotPaso2:", err);
    return res.status(500).json({ error: "Error al restablecer la contraseña" });
  }
};

// ME
export const me = async (req, res) => {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ message: "No token" });
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select("-claveHash");
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    return res.json({ user });
  } catch (err) {
    return res.status(401).json({ message: "Token inválido" });
  }
};

