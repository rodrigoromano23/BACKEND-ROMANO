import mongoose from "mongoose";

const JuegoSchema = new mongoose.Schema({
  titulo: { type: String /*, required: true*/ },
  descripcion: { type: String },
  categoria: { type: String },
  imagen: { type: String }, // URL o path del archivo subido
  link: { type: String },   // enlace al juego
  createdAt: { type: Date, default: Date.now }
});

// Evita OverwriteModelError en recargas con nodemon
const Juego = mongoose.models.Juego || mongoose.model("Juego", JuegoSchema);

export default Juego;

