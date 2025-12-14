import SensoPersona from "../models/sensoPersona.js";
// =============expor senso===============================

import XLSX from "xlsx";

export const exportSensoByYear = async (req, res, next) => {
  try {
    const year = Number(req.params.year);
    if (!year) {
      return res.status(400).json({ msg: "Año inválido" });
    }

    const registros = await SensoPersona.find({ anio: year });

    if (!registros.length) {
      return res.status(404).json({ msg: "No hay datos para ese año" });
    }

    const total = registros.length;

    // ======================
    // Discapacidad Física
    // ======================
    const fisica = {};
    registros.forEach((p) => {
      const tipo = p.discapacidadFisica?.tipo;
      if (tipo) fisica[tipo] = (fisica[tipo] || 0) + 1;
    });

    // ======================
    // Discapacidad Neurológica
    // ======================
    const neuro = {};
    registros.forEach((p) => {
      const tipo = p.discapacidadNeurologica?.tipo;
      if (tipo) neuro[tipo] = (neuro[tipo] || 0) + 1;
    });

    // ======================
    // Grados
    // ======================
    const grados = { leve: 0, moderado: 0, grave: 0 };
    registros.forEach((p) => {
      const g1 = p.discapacidadFisica?.grado;
      const g2 = p.discapacidadNeurologica?.grado;
      if (g1) grados[g1]++;
      if (g2) grados[g2]++;
    });

    // ======================
    // Excel
    // ======================
    const wb = XLSX.utils.book_new();

    // Hoja 1: Resumen
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet([
        { Año: year, "Total personas": total },
      ]),
      "Resumen"
    );

    // Hoja 2: Física
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(
        Object.entries(fisica).map(([tipo, cant]) => ({
          Tipo: tipo,
          Cantidad: cant,
          Porcentaje: ((cant / total) * 100).toFixed(2) + "%",
        }))
      ),
      "Discapacidad Física"
    );

    // Hoja 3: Neurológica
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(
        Object.entries(neuro).map(([tipo, cant]) => ({
          Tipo: tipo,
          Cantidad: cant,
          Porcentaje: ((cant / total) * 100).toFixed(2) + "%",
        }))
      ),
      "Discapacidad Neurológica"
    );

    // Hoja 4: Grados
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(
        Object.entries(grados).map(([grado, cant]) => ({
          Grado: grado,
          Cantidad: cant,
        }))
      ),
      "Grados"
    );

    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=senso_${year}.xlsx`
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.send(buffer);
  } catch (err) {
    next(err);
  }
};

export const getSensoYears = async (req, res, next) => {
  try {
    const years = await Senso.distinct("anio");

    // ordenar de menor a mayor
    years.sort((a, b) => a - b);

    res.json(years);
  } catch (err) {
    next(err);
  }
};

/**
 * 🟢 Crear persona Senso (admin)
 */
export const crearSensoPersona = async (req, res, next) => {
  try {
    const persona = new SensoPersona(req.body);
    await persona.save();

    res.status(201).json({
      msg: "Registro Senso creado correctamente",
      persona,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 🥧 Estadísticas del año actual (gráfico circular)
 */
export const estadisticasAnioActual = async (req, res, next) => {
  try {
    const anioActual = new Date().getFullYear();

    const personas = await SensoPersona.find({ anio: anioActual });

    if (personas.length === 0) {
      return res.json({
        anio: anioActual,
        total: 0,
        fisica: {},
        neurologica: {},
      });
    }

    const total = personas.length;

    const fisica = {};
    const neurologica = {};

    personas.forEach((p) => {
      if (p.discapacidadFisica?.tipo) {
        fisica[p.discapacidadFisica.tipo] =
          (fisica[p.discapacidadFisica.tipo] || 0) + 1;
      }

      if (p.discapacidadNeurologica?.tipo) {
        neurologica[p.discapacidadNeurologica.tipo] =
          (neurologica[p.discapacidadNeurologica.tipo] || 0) + 1;
      }
    });

    res.json({
      anio: anioActual,
      total,
      fisica,
      neurologica,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 📊 Comparativa por años (gráfico de barras)
 */
export const comparativaPorAnios = async (req, res, next) => {
  try {
    const resultado = await SensoPersona.aggregate([
      {
        $group: {
          _id: "$anio",
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const data = resultado.map((item) => ({
      anio: item._id,
      total: item.total,
    }));

    res.json(data);
  } catch (err) {
    next(err);
  }
};

 // Asegúrate de importar tu modelo correctamente

// Obtener todos los registros de SensoPersona
export const getAllSenso = async (req, res) => {
  try {
    const sensoData = await SensoPersona.find(); // Obtiene todos los registros
    res.json(sensoData); // Devuelve los datos en formato JSON
  } catch (error) {
    console.error("Error al obtener los datos del censo:", error);
    res.status(500).json({ message: "Error al obtener los datos del censo" });
  }
};

// 🧨 BORRAR TODOS LOS DATOS DEL SENSO (ADMIN)
export const borrarTodoSenso = async (req, res) => {
  try {
    console.log("🧨 Solicitud para borrar TODOS los registros de Senso");

    const result = await SensoPersona.deleteMany({});

    console.log(`✅ Registros eliminados: ${result.deletedCount}`);

    res.json({
      ok: true,
      message: "Todos los registros del Senso fueron eliminados",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("❌ Error borrando Senso:", error);
    res.status(500).json({
      ok: false,
      message: "Error al borrar los datos del Senso",
    });
  }
};

