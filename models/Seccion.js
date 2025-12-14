import mongoose from "mongoose";

const SeccionSchema = new mongoose.Schema({
  tipo: { type: String, required: true }, // quienes, talleres, salidas, juegos, proyectos
  titulo: String,
  descripcion: String,
  contenido: String,
  plantilla: { type: Number, default: 1 },
  media: [String],
  links: [String],
  slug: String,
  visible: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Seccion", SeccionSchema);
