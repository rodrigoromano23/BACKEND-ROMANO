

// controllers/publicacionesController.js

import mongoose from "mongoose";
import Publicacion from "../models/Publicacion.js";
import Publicaciones2 from "../models/Publicaciones2.js";
import cloudinary from "../config/cloudinary.js";

// ============================================================
//  SUBIR A CLOUDINARY
// ============================================================
const uploadToCloudinary = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: "admin_secciones",
      resource_type: "auto",
    });
    return result.secure_url;
  } catch (error) {
    console.error("Error subiendo a Cloudinary:", error);
    throw new Error("Error al subir imagen");
  }
};

// ============================================================
//  CANVAS → CREAR PUBLICACION
// ============================================================
export const crearPublicacionCanvas = async (req, res) => {
  try {
    const { section, imageUrl, titulo, descripcion } = req.body;

    // VALIDACIONES
    if (!section || section.trim() === "") {
      return res.status(400).json({ msg: "La sección es obligatoria" });
    }

    if (!imageUrl || typeof imageUrl !== "string") {
      return res.status(400).json({ msg: "La imagen es obligatoria" });
    }

    // Validación básica de Base64
    // Detectar si es base64 o URL
    const esBase64 = imageUrl.startsWith("data:image/");
    const esUrl = imageUrl.startsWith("http://") || imageUrl.startsWith("https://");

    if (!esBase64 && !esUrl) {
      return res.status(400).json({ msg: "Formato de imagen inválido" });
    }

    // Si es base64, validar tamaño
    if (esBase64) {
      const base64Size = (imageUrl.length * 3) / 4;
      if (base64Size > 2_000_000) {
        return res.status(400).json({ msg: "La imagen no puede superar los 2MB" });
      }
    }


    // Crear publicación
    const nueva = await Publicacion.create({
      section,
      imageUrl,
      titulo: titulo || "",
      descripcion: descripcion || "",
    });

    res.json(nueva);

  } catch (error) {
    console.error("Error creando publicación (canvas):", error);
    res.status(500).json({ msg: "Error creando publicación (canvas)" });
  }
};


// ============================================================
// TEXTO → CREAR PUBLICACIÓN
// ============================================================
export const crearPublicacionTexto = async (req, res) => {
  try {
    const { section, content } = req.body;

    if (!section) return res.status(400).json({ msg: "Sección obligatoria" });
    if (!content || content.trim().length < 3) {
      return res.status(400).json({ msg: "El texto es muy corto" });
    }

    const nueva = await Publicaciones2.create({
      section,
      type: "texto",
      textContent: content,
    });

    res.json(nueva);
  } catch (error) {
    res.status(500).json({ msg: "Error creando texto" });
  }
};

// ============================================================
//  VIDEO → CREAR PUBLICACIÓN
// ============================================================
export const crearPublicacionVideo = async (req, res) => {
  try {
    const { section, videoLink, externalLink } = req.body;

    if (!section) return res.status(400).json({ msg: "La sección es obligatoria" });
    if (!videoLink) return res.status(400).json({ msg: "Debe enviar un link de video" });

    // Validación de URL
    const youtubeRegex =
      /(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)/;

    if (!youtubeRegex.test(videoLink)) {
      return res.status(400).json({ msg: "El link debe ser un video de YouTube válido" });
    }

    function convertirAEmbed(url) {
      try {
        if (url.includes("watch?v=")) {
          return url.replace("watch?v=", "embed/");
        }
        if (url.includes("youtu.be/")) {
          return `https://www.youtube.com/embed/${url.split("youtu.be/")[1]}`;
        }
        return url;
      } catch {
        return url;
      }
    }

    const videoEmbed = convertirAEmbed(videoLink);

    const nueva = await Publicaciones2.create({
      section,
      type: "video",
      videoLink: videoEmbed,
      externalLink: externalLink || "",
    });

    res.json(nueva);

  } catch (error) {
    console.error("Error en crearPublicacionVideo:", error);
    res.status(500).json({ msg: "Error creando video" });
  }
};

// ============================================================
//  CARRUSEL → CREAR PUBLICACIÓN
// ============================================================
export const crearPublicacionCarrusel = async (req, res) => {
  try {
    const { section, externalLink } = req.body;

    if (!section) {
      return res.status(400).json({ msg: "La sección es obligatoria" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ msg: "Debe enviar al menos una imagen" });
    }

    if (req.files.length > 10) {
      return res.status(400).json({ msg: "Máximo 10 imágenes por carrusel" });
    }

    const urls = [];

    for (const file of req.files) {
      // Validación tipo
      if (!file.mimetype.startsWith("image/")) {
        return res.status(400).json({ msg: "Todos los archivos deben ser imágenes" });
      }

      // Tamaño máx 2MB
      if (file.size > 2_000_000) {
        return res.status(400).json({
          msg: `La imagen ${file.originalname} supera los 2MB`
        });
      }

      const base64 = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
      const uploadUrl = await uploadToCloudinary(base64);
      urls.push(uploadUrl);
    }

    const nueva = await Publicaciones2.create({
      section,
      type: "carrusel",
      images: urls,
      externalLink: externalLink || "",
    });

    res.json(nueva);

  } catch (error) {
    res.status(500).json({ msg: "Error creando carrusel" });
  }
};

// ============================================================
//  PUBLICACIONES POR SECCIÓN
// ============================================================
export const obtenerPorSeccion = async (req, res) => {
  try {
    const { section } = req.params;

    if (!section) return res.status(400).json({ msg: "Falta sección" });

    const canvas = await Publicacion.find({ section }).sort("-createdAt");
    const editor = await Publicaciones2.find({ section }).sort("-createdAt");

    res.json({ canvas, editor });
  } catch (error) {
    res.status(500).json({ msg: "Error obteniendo publicaciones" });
  }
};

// ============================================================
//  OBTENER INICIO ACTUAL
// ============================================================
export const obtenerInicioActual = async (req, res) => {
  try {
    const pub1 = await Publicacion.findOne().sort("-createdAt");
    const pub2 = await Publicaciones2.findOne().sort("-createdAt");

    res.json({ canvasActual: pub1 || null, editorActual: pub2 || null });
  } catch {
    res.status(500).json({ msg: "Error obteniendo inicio" });
  }
};

// ============================================================
// ELIMINAR PUBLICACIÓN
// ============================================================
export const eliminarPublicacion = async (req, res) => {
  try {
    const { id, tipo } = req.params;

    // Validar ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "ID inválido" });
    }

    if (!["canvas", "editor"].includes(tipo)) {
      return res.status(400).json({ msg: "Tipo inválido (canvas/editor)" });
    }

    const Modelo = tipo === "canvas" ? Publicacion : Publicaciones2;

    const eliminado = await Modelo.findByIdAndDelete(id);

    if (!eliminado) {
      return res.status(404).json({ msg: "Publicación no encontrada" });
    }

    res.json({ msg: "Eliminado correctamente" });

  } catch (error) {
    res.status(500).json({ msg: "Error eliminando publicación" });
  }
};

// ============================================================
//  TRAER TODAS LAS PUBLICACIONES
// ============================================================
export const obtenerTodasPublicaciones = async (req, res) => {
  try {
    const canvas = await Publicacion.find().sort({ createdAt: -1 });
    const editor = await Publicaciones2.find().sort({ createdAt: -1 });

    res.json({ canvas, editor });
  } catch (error) {
    res.status(500).json({ msg: "Error obteniendo publicaciones" });
  }
};





