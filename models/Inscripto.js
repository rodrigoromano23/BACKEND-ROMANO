// models/Inscripto.mjs
/*import mongoose from "mongoose";

const InscriptoSchema = new mongoose.Schema({
  apellidoNombre: { type: String, required: true },
  edad: Number,
  dni: String,
  fechaNacimiento: Date,
  direccion: String,
  correo: String,
  celular: String,

  talleres: [String],
  

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Inscripto", InscriptoSchema);*/

// NUEVO CON SEGURIDAD

// models/Inscripto.mjs
// models/Inscripto.mjs
import mongoose from "mongoose";

const InscriptoSchema = new mongoose.Schema({
  apellidoNombre: { 
    type: String, 
    required: [true, "El nombre y apellido es obligatorio"],
    minlength: [3, "Debe tener al menos 3 caracteres"],
    maxlength: [60, "Debe tener como máximo 60 caracteres"]
  },

  edad: { 
    type: Number, 
    min: [1, "Edad inválida"],
    max: [120, "Edad inválida"] 
  },

  dni: { 
    type: String,
    validate: {
      validator: (v) => /^\d{7,8}$/.test(v),
      message: "El DNI debe tener exactamente 7 u 8 dígitos"
    }
  },

  fechaNacimiento: Date,
  direccion: { type: String, maxlength: 80 },
  correo: { 
    type: String,
    validate: {
      validator: (v) =>
        /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v),
      message: "Correo electrónico inválido"
    }
  },

  celular: {
    type: String,
    validate: {
      validator: (v) => /^\d{8,15}$/.test(v),
      message: "El número de celular es inválido"
    }
  },

  talleres: {
    type: [String],
    default: []
  },

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Inscripto", InscriptoSchema);





