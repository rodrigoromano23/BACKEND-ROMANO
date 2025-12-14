import { uploadBufferToCloudinary } from '../config/cloudinary.js';
import Juego from "../models/Juego.js";

// Crear un nuevo juego
export const crearJuego = async (req, res) => {
  try {
    const { titulo, descripcion, categoria, link } = req.body;
    const imagen = req.file ? req.file.buffer : null; // Obtener la imagen del formulario

    // Subir imagen a Cloudinary
    let imageUrl = null;
    if (imagen) {
      imageUrl = await uploadBufferToCloudinary(imagen); // Subir la imagen al servidor de Cloudinary
    }

    const newJuego = new Juego({
      titulo,
      descripcion,
      categoria,
      imagen: imageUrl, // Guardar la URL de la imagen
      link,
    });

    await newJuego.save();

    res.status(201).json({ message: "Juego creado exitosamente", juego: newJuego });
  } catch (err) {
    console.error("Error al crear el juego:", err);
    res.status(500).json({ error: "Error al crear el juego" });
  }
};

// Eliminar juego
export const eliminarJuego = async (req, res) => {
  const { id } = req.params;
  try {
    const juego = await Juego.findByIdAndDelete(id); // Usando el modelo de Mongoose
    if (!juego) {
      return res.status(404).send("Juego no encontrado");
    }
    res.status(200).send("Juego eliminado correctamente");
  } catch (error) {
    console.error(error);
    res.status(500).send("Hubo un error al eliminar el juego");
  }
};


// Obtener juegos
export const obtenerJuegos = async (req, res) => {
  try {
    const juegos = await Juego.find(); // 
    res.status(200).json(juegos); // 
  } catch (error) {
    console.error(error);
    res.status(500).send("Hubo un error al obtener los juegos");
  }
};
