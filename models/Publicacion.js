import mongoose from "mongoose";

const PublicacionSchema = new mongoose.Schema(
  {
    section: { type: String, required: true },
    imageUrl: { type: String, required: true },
    titulo: { type: String, default: "" },
    descripcion: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.model("Publicacion", PublicacionSchema);
