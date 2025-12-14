import mongoose from "mongoose";

const TallerSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: String,
  diasHorarios: [{ dia: String, horario: String }],
  cupo: Number,
  createdAt: { type: Date, default: Date.now }
});

// Evita OverwriteModelError al recargar con nodemon
const Taller = mongoose.models.Taller || mongoose.model("Taller", TallerSchema);

export default Taller;

