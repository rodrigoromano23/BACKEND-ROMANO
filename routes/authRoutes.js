


//====================================================================
//======================================================================

import express from "express";
import bcrypt from "bcryptjs";
import { uploadBufferToCloudinary } from "../config/cloudinary.js";
import multer from "multer";
import User from "../models/User.js";
import jwt from "jsonwebtoken";


const router = express.Router();
const upload = multer(); // multer sin storage, solo para buffer

// ================================
// REGISTRO
// ================================
router.post("/register", upload.single("foto"), async (req, res) => {
  console.log("========== NUEVO REGISTRO ==========");
  console.log("REQ.BODY recibido:", req.body);
  console.log("TIPOS REQ.BODY:", Object.entries(req.body).map(([k, v]) => [k, typeof v, v]));
  console.log("REQ.FILE recibido:", req.file);

  try {
    const { nombre, correo, clave, edad, dni, fechaNacimiento, domicilio, celular, rol } = req.body;

    // -----------------------
    // VALIDACIONES MANUALES
    // -----------------------
    const errores = [];
    if (!nombre) errores.push({ msg: "El nombre es obligatorio", path: "nombre" });
    if (!correo || !/^\S+@\S+\.\S+$/.test(correo)) errores.push({ msg: "Correo inválido", path: "correo" });
    if (!clave || clave.length < 3) errores.push({ msg: "La clave debe tener al menos 3 caracteres", path: "clave" });
    if (!edad || isNaN(Number(edad)) || Number(edad) <= 0) errores.push({ msg: "Edad inválida", path: "edad" });
    if (!fechaNacimiento || isNaN(new Date(fechaNacimiento).getTime()))
      errores.push({ msg: "Fecha de nacimiento no válida", path: "fechaNacimiento" });
    if (!dni) errores.push({ msg: "DNI obligatorio", path: "dni" });
    if (!domicilio) errores.push({ msg: "Domicilio obligatorio", path: "domicilio" });

    if (errores.length > 0) {
      console.log("Errores de validación:", errores);
      return res.status(400).json({ msg: "Errores de validación", errors: errores });
    }

    // -----------------------
    // Verificar correo duplicado
    // -----------------------
    const existe = await User.findOne({ correo });
    if (existe) {
      console.log("Correo ya registrado:", correo);
      return res.status(400).json({ msg: "El correo ya está registrado" });
    }

    // -----------------------
    // Subir foto a Cloudinary si existe
    // -----------------------
    let fotoUrl = null;
    if (req.file) {
      console.log("Subiendo foto a Cloudinary...");
      fotoUrl = await uploadBufferToCloudinary(req.file.buffer);
      console.log("Foto subida:", fotoUrl);
    }

    // -----------------------
    // Convertir tipos y hash
    // -----------------------
    const edadNum = Number(edad);
    const fechaObj = new Date(fechaNacimiento);
    const claveHash = await bcrypt.hash(clave, 10);

    // -----------------------
    // Crear usuario
    // -----------------------
    const usuario = await User.create({
      nombre,
      correo,
      claveHash,
      edad: edadNum,
      dni,
      fechaNacimiento: fechaObj,
      domicilio,
      celular,
      rol,
      fotoUrl,
    });

    console.log("Usuario registrado correctamente:", usuario);
    res.json({ msg: "Usuario registrado correctamente", usuario });
  } catch (err) {
    console.error("ERROR REGISTRO:", err);
    res.status(500).json({ msg: "Error al registrar", error: err.message });
  }
});

// ===========================
// LOGIN – ahora con rol automático
// ===========================
router.post("/login", async (req, res) => {
  try {
    console.log("REQ.BODY LOGIN:", req.body);
    const { nombre, clave } = req.body;

    if (!nombre || !clave) {
      return res.status(400).json({ msg: "Faltan datos requeridos" });
    }

    // Buscar usuario y traer su rol
    const usuario = await User.findOne({ nombre });
    if (!usuario) return res.status(404).json({ msg: "Usuario no encontrado" });

    const match = await bcrypt.compare(clave, usuario.claveHash);
    if (!match) return res.status(400).json({ msg: "Clave incorrecta" });

    const token = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // Devolvemos el rol automáticamente
    res.json({
      msg: "Login correcto",
      token,
      user: {
        id: usuario._id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        foto: usuario.foto,
        rol: usuario.rol, // ✅ ahora el frontend recibe el rol real
      },
    });
  } catch (err) {
    console.error("ERROR LOGIN:", err);
    res.status(500).json({ msg: "Error al hacer login", error: err.message });
  }
});

// ===========================
// VALIDAR TOKEN
// ===========================
router.get("/me", async (req, res) => {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ msg: "Token faltante" });

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const usuario = await User.findById(decoded.id).select("-claveHash");
    res.json(usuario);
  } catch (err) {
    res.status(401).json({ msg: "Token inválido", error: err.message });
  }
});

// ===========================
// OLVIDÉ MI CLAVE
// ===========================
router.post("/forgot", async (req, res) => {
  try {
    const { nombre, correo, celular } = req.body;
    console.log("Datos recibidos:", { nombre, correo, celular });
    const user = await User.findOne({ nombre, correo, celular });
    console.log("Usuario encontrado:", user);
    if (!user) return res.status(404).json({ msg: "Datos incorrectos" });

    // Aquí vacías la contraseña para permitir el siguiente paso
    user.claveHash = "";
    await user.save({validate: false});
    res.json({ msg: "Datos verificados. Ahora puede ingresar la nueva clave." });
  } catch (err) {
    console.error("Error durante la recuperación:", err);
    res.status(500).json({ msg: "Error durante recuperación", error: err.message });
  }
});


// ===========================
// RESETEAR CLAVE
// ===========================
router.post("/reset", async (req, res) => {
  try {
    const { correo, nuevaClave } = req.body;
    const user = await User.findOne({ correo });
    if (!user) return res.status(404).json({ msg: "Usuario no encontrado" });

    // Hashear la nueva contraseña y actualizar el campo claveHash
    const hash = await bcrypt.hash(nuevaClave, 10);
    user.claveHash = hash;
    await user.save();
    res.json({ msg: "Clave actualizada correctamente" });
  } catch (err) {
    res.status(500).json({ msg: "Error al actualizar clave", error: err.message });
  }
});
//==================================================================
//==================================================================
// ===========================
// ACTUALIZAR PERFIL
// ===========================
router.put("/update-me", upload.single("foto"), async (req, res) => {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ msg: "Token faltante" });

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const usuario = await User.findById(decoded.id);
    if (!usuario) return res.status(404).json({ msg: "Usuario no encontrado" });

    const { nombre, correo, celular, domicilio, fechaNacimiento, dni, nuevaClave } = req.body;

    if (nombre) usuario.nombre = nombre;
    if (correo) usuario.correo = correo;
    if (celular) usuario.celular = celular;
    if (domicilio) usuario.domicilio = domicilio;
    if (fechaNacimiento) usuario.fechaNacimiento = new Date(fechaNacimiento);
    if (dni) usuario.dni = dni;

    if (nuevaClave) {
      const hash = await bcrypt.hash(nuevaClave, 10);
      usuario.claveHash = hash;
    }

    if (req.file) {
      usuario.foto = req.file.filename;
    }

    await usuario.save();

    const usuarioSinClave = usuario.toObject();
    delete usuarioSinClave.claveHash;

    res.json(usuarioSinClave);
  } catch (err) {
    console.error("ERROR update-me:", err);
    res.status(500).json({ msg: "Error al actualizar perfil", error: err.message });
  }
});



export default router;










