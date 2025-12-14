/*import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  nombre: String,
  correo: String,
  claveHash: String,
  rol: String,
  edad: Number,
  dni: String,
  fechaNacimiento: Date,
  domicilio: String,
  celular: String,
});

const User = mongoose.model("User", userSchema, "base1"); // ← tercer parámetro es la collection
export default User;*/

/*import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  nombre: String,
  correo: String,
  claveHash: String,
  rol: { type: String, enum: ["jefe", "empleado"], default: "empleado" },
  edad: Number,
  dni: String,
  fechaNacimiento: Date,
  domicilio: String,
  celular: String,
  fotoUrl: { type: String, default: "/uploads/default.png" } // <-- nuevo campo
});

const User = mongoose.model("User", userSchema, "base1"); // colección existente
export default User;*/

//NUEVO CON SEGURIDAD

// models/User.mjs
// models/User.mjs
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  nombre: { 
    type: String,
    required: [true, "El nombre es obligatorio"],
    minlength: [5, "Debe tener mínimo 5 caracteres"]
  },

  correo: { 
    type: String,
    required: [true, "El correo es obligatorio"],
    unique: true,
    validate: {
      validator: (v) =>
        /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v),
      message: "Correo electrónico inválido"
    }
  },

  claveHash: { 
    type: String,
    required: false,
    
  },

  rol: { 
    type: String,
    enum: ["jefe", "empleado"],
    default: "empleado"
  },

  edad: { 
    type: Number,
    min: [18, "La edad mínima es 18"],
    max: [90, "Edad inválida"]
  },

  dni: {
    type: String,
    required: [true, "El DNI es obligatorio"],
    validate: {
      validator: (v) => /^\d{8}$/.test(v),
      message: "El DNI debe tener exactamente 8 dígitos"
    }
  },

  fechaNacimiento: Date,

  domicilio: { type: String, maxlength: 100 },

  celular: {
    type: String,
    validate: {
      validator: (v) => /^\d{8,15}$/.test(v),
      message: "Número de celular inválido"
    }
  },

  fotoUrl: { type: String, default: "/uploads/default.png" }
});

const User = mongoose.model("User", userSchema, "base1");
export default User;



