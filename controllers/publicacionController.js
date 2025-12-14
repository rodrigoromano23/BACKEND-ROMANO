


import Publicacion from "../models/Publicacion.js";
import { uploadBufferToCloudinary } from "../utils/cloudinary.js";

export const crearPublicacion = async (req, res, next) => {
  try {
    const { section, type, textContent, imageUrl, videoUrl } = req.body;

    // ======================================================
    //  CASE 1: Canvas → recibe imageUrl directo desde el front
    // ======================================================
    if (type === "canvas") {
      const nueva = await Publicacion.create({
        section,
        type,
        imageUrl
      });
      return res.status(201).json(nueva);
    }

    // ======================================================
    // CASE 2: Texto puro
    // ======================================================
    if (type === "text") {
      const nueva = await Publicacion.create({
        section,
        type,
        textContent
      });
      return res.status(201).json(nueva);
    }

    // ======================================================
    // CASE 3: Video → puede venir como URL o archivo
    // ======================================================
    if (type === "video") {
      let finalVideoUrl = videoUrl;

      // Si llega un archivo por multer, subirlo a cloudinary
      if (req.file) {
        finalVideoUrl = await uploadBufferToCloudinary(
          req.file.buffer,
          "video"
        );
      }

      if (!finalVideoUrl) {
        return res.status(400).json({ error: "No se envió video ni URL." });
      }

      const nueva = await Publicacion.create({
        section,
        type,
        videoUrl: finalVideoUrl
      });

      return res.status(201).json(nueva);
    }

    // ======================================================
    //  CASE 4: Carrusel → múltiples imágenes enviadas por FormData
    // ======================================================
    if (type === "carousel") {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "No se enviaron imágenes" });
      }

      // Subir cada imagen a Cloudinary
      const imageUploads = await Promise.all(
        req.files.map(file =>
          uploadBufferToCloudinary(file.buffer, "image")
        )
      );

      const nueva = await Publicacion.create({
        section,
        type,
        images: imageUploads
      });

      return res.status(201).json(nueva);
    }

    // ======================================================
    //  Tipo inválido
    // ======================================================
    return res.status(400).json({ error: "Tipo de publicación inválido" });

  } catch (err) {
    next(err);
  }
};







