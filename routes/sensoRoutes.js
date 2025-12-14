import express from "express";
import {
  crearSensoPersona,
  estadisticasAnioActual,
  comparativaPorAnios,
  getSensoYears,
  exportSensoByYear,
  getAllSenso,
  borrarTodoSenso,
} from "../controllers/sensoController.js";
import { authenticate, authorizeRole } from "../middleware/authMiddleware.js";
import SensoPersona from '../models/sensoPersona.js';
import XLSX from 'xlsx'; // 
import path from 'path'; // 

const router = express.Router();

// ===============================
// CREAR REGISTRO SENSO (ADMIN)
// ===============================
router.post(
  "/",
  authenticate,
  authorizeRole("empleado"),
  (req, res, next) => {
    console.log("Recibiendo solicitud para crear un nuevo registro Senso...");
    next();
  },
  crearSensoPersona
);

// ========================================
// ESTADÍSTICAS AÑO ACTUAL (PÚBLICO)
// ========================================
router.get("/estadisticas", (req, res, next) => {
  console.log("Solicitando estadísticas para el año actual...");
  next();
}, estadisticasAnioActual);

// ========================================
// COMPARATIVA POR AÑOS (PÚBLICO)
// ========================================
router.get("/comparativa", (req, res, next) => {
  console.log("Solicitando comparativa entre años...");
  next();
}, comparativaPorAnios);

//=========================================
//============== years ====================
//=========================================
router.get(
  "/years",
  authenticate,
  authorizeRole("empleado"),
  (req, res, next) => {
    console.log("Recibiendo solicitud para obtener los años disponibles...");
    next();
  },
  getSensoYears
);

//==========================================
// Exportar datos por año (ADMIN)
// ========================================
router.get(
  "/export/:year",
  authenticate,
  authorizeRole("empleado"),
  (req, res, next) => {
    console.log(`Recibiendo solicitud para exportar datos del año ${req.params.year}...`);
    next();
  },
  exportSensoByYear
);

// ========================================
// Exportar gráficos por año (ADMIN)
// ========================================
router.get("/senso/export/:year", async (req, res) => {
  const { year } = req.params;
  console.log(`Recibiendo solicitud para exportar gráfico del año ${year}...`);

  try {
    const data = await SensoPersona.find({ anio: year });
    if (!data || data.length === 0) {
      console.log(`No se encontraron datos para el año ${year}`);
      return res.status(404).send("No se encontraron datos para este año.");
    }

    // Llamamos a una función (debes definirla) para generar los datos del gráfico
    const pieData = generatePieData(data);
    console.log("Generando los datos para el gráfico de pie...");

    const ws = XLSX.utils.json_to_sheet(pieData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Gráfico_${year}`);

    const fileName = `Grafico_Senso_${year}.xlsx`;
    const filePath = path.join(__dirname, fileName);

    // Escribir el archivo en disco
    console.log("Escribiendo el archivo Excel...");
    XLSX.writeFile(wb, filePath);

    // Descargar el archivo
    console.log("Enviando archivo para descarga...");
    res.download(filePath, fileName);
  } catch (error) {
    console.error("Error exportando los datos:", error);
    res.status(500).send("Error al exportar los datos.");
  }
});

// ========================================
// CARGAR LOS DATOS SENSO (PÚBLICO)
// ========================================
router.get("/", async (req, res) => {
  console.log("Recibiendo solicitud GET para cargar todos los datos Senso...");

  try {
    const data = await SensoPersona.find();
    if (!data || data.length === 0) {
      console.log("No se encontraron datos Senso.");
      return res.status(404).send("No se encontraron datos.");
    }
    console.log("Datos Senso encontrados: ", data);
    res.json(data); // Devuelve los datos como JSON
  } catch (error) {
    console.error("Error obteniendo los datos:", error);
    res.status(500).send("Error al obtener los datos.");
  }
});

router.get("/senso", getAllSenso);

//  BORRAR TODO EL SENSO (solo ADMIN / EMPLEADO)
router.delete(
  "/",
  authenticate,
  authorizeRole("empleado"),
  borrarTodoSenso
);

export default router;
