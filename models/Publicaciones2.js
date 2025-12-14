import mongoose from "mongoose";

const publicacionSchema = new mongoose.Schema(
  {
    section: { type: String, required: true },

    type: {
      type: String,
      enum: ["imagen", "carrusel", "video", "texto"],
      required: true
    },

    // Texto
    textContent: String,

    // Imagen o archivo
    externalLink: String,

    // Video
    videoLink: String,

    // Carrusel
    images: [String]
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Publicaciones2", publicacionSchema);


