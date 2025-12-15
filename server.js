import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

import seccionesRoutes from "./routes/seccionesRoutes.js";
import talleresRoutes from "./routes/talleresRoutes.js";
import juegosRoutes from "./routes/juegosRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import inscriptosRoutes from "./routes/inscriptosRoutes.js";
import empleadosRoutes from "./routes/empleadosRoutes.js";
//import publicacionesRoutes from "./routes/publicacionesRoutes.js";
import editorRoutes from "./routes/editorRoutes.js";

//RUTA === SENSO===
import sensoRoutes from "./routes/sensoRoutes.js"

//juegos
import juegoRoutes from "./routes/juegosRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({
  origin: "https://frontend-romano.onrender.com/", // puerto donde corre Vite/React
  credentials: true
}));
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));

// Carpeta estática para imágenes subidas
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Conexión MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB conectado"))
  .catch((err) => console.error("Error conectando Mongo:", err));

// Usar rutas
app.use("/api/secciones", seccionesRoutes);
app.use("/api/inscriptos", inscriptosRoutes);
app.use("/api/talleres", talleresRoutes);
app.use("/api/juegos", juegosRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", empleadosRoutes);

//SENSO================================================
app.use("/api/senso", sensoRoutes);

// Rutas de editor (nuevo conjunto de publicaciones)
app.use("/api/editor", editorRoutes);

//juegos ruta
app.use("/api/juegos", juegosRoutes);

// Middleware de errores
app.use((err, req, res, next) => {
  console.error("ERROR:", err);
  res.status(500).json({
    msg: "Error interno del servidor",
    error: err.message,
  });
});

// Servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🔥 Backend funcionando en puerto ${PORT}`));





