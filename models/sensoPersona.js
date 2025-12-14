import mongoose from "mongoose";

const SensoPersonaSchema = new mongoose.Schema(
  {
    anio: {
      type: Number,
      default: () => new Date().getFullYear(),
      index: true,
    },

    // Datos básicos
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    edad: {
      type: Number,
      required: true,
      min: 0,
      max: 120,
    },
    sexo: {
      type: String,
      enum: ["masculino", "femenino", "otro"],
      required: true,
    },

    // Discapacidad física
    discapacidadFisica: {
      tipo: {
        type: String,
        enum: [
          "paralisis cerebral",
          "espina bifida",
          "amputacion",
          "artritis",
          "fibromialgia",
          "esclerosis multiple",
          "parkinson",
          "distrofia muscular",
          "otro",
        ],
      },
      grado: {
        type: String,
        enum: ["leve", "moderado", "grave"],
      },
      descripcionOtra: String,
    },

    // Discapacidad neurológica
    discapacidadNeurologica: {
      tipo: {
        type: String,
        enum: [
          "sindrome down",
          "autismo",
          "retraso madurativo",
          "epilepsia",
          "cerebro lesion",
          "alzheimer",
          "esquizofrenia",
          "tdah",
          "enfermedad de alzheimer",
          "paralisis cerebral",
          "otra",
        ],
      },
      grado: {
        type: String,
        enum: ["leve", "moderado", "grave"],
      },
      descripcionOtra: String,
    },

    observaciones: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("SensoPersona", SensoPersonaSchema);
