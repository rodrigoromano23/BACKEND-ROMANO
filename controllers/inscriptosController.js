import Inscripto from "../models/Inscripto.js";
import ExcelJS from "exceljs";

// Crear Inscripto
export const createInscripto = async (req, res, next) => {
  try {
    if (!req.body.apellidoNombre) {
      return res.status(400).json({ msg: "Apellido y nombre obligatorio" });
    }

    const talleresSeleccionados = req.body.talleres || [];

    const nuevo = await Inscripto.create({
      ...req.body,
      talleres: talleresSeleccionados
    });

    res.status(201).json(nuevo);
  } catch (err) {
    next(err);
  }
};

// Obtener todos los inscriptos
export const getInscriptos = async (req, res, next) => {
  try {
    const inscriptos = await Inscripto.find().sort({ createdAt: -1 });
    res.json(inscriptos);
  } catch (err) {
    next(err);
  }
};

// Exportar Excel
export const exportInscriptos = async (req, res, next) => {
  try {
    const alumnos = await Inscripto.find().sort({ createdAt: -1 });

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Inscriptos");

    ws.columns = [
      { header: "Apellido y Nombre", key: "apellidoNombre", width: 30 },
      { header: "Edad", key: "edad", width: 10 },
      { header: "DNI", key: "dni", width: 15 },
      { header: "Fecha Nacimiento", key: "fechaNacimiento", width: 15 },
      { header: "Dirección", key: "direccion", width: 30 },
      { header: "Correo", key: "correo", width: 25 },
      { header: "Celular", key: "celular", width: 20 },
      { header: "Talleres", key: "talleres", width: 40 },
      { header: "Fecha Registro", key: "createdAt", width: 20 }
    ];

    alumnos.forEach(a => {
      ws.addRow({
        apellidoNombre: a.apellidoNombre,
        edad: a.edad,
        dni: a.dni,
        fechaNacimiento: a.fechaNacimiento
          ? new Date(a.fechaNacimiento).toLocaleDateString()
          : "",
        direccion: a.direccion,
        correo: a.correo,
        celular: a.celular,

        // ⬇️ Convertimos array de strings a una línea de texto
        talleres: a.talleres?.join(", ") || "",

        createdAt: a.createdAt
          ? new Date(a.createdAt).toLocaleString()
          : ""
      });
    });

    res.setHeader("Content-Type", "application/vnd.openxmlformats");
    res.setHeader("Content-Disposition", "attachment; filename=inscriptos.xlsx");

    await wb.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
};

// Eliminar inscripto
export const deleteInscripto = async (req, res, next) => {
  try {
    await Inscripto.findByIdAndDelete(req.params.id);
    res.json({ msg: "Inscripto eliminado" });
  } catch (err) {
    next(err);
  }
};



export const clearInscriptos = async (req, res) => {
  try {
    await Inscripto.deleteMany({});
    res.json({ msg: "Lista de inscriptos eliminada correctamente" });
  } catch (err) {
    console.error("Error al limpiar inscriptos:", err);
    res.status(500).json({ msg: "Error al limpiar inscriptos" });
  }
};

//por dni 

export const deleteInscriptoByDni = async (req, res, next) => {
  try {
    const { dni } = req.params;

    const eliminado = await Inscripto.findOneAndDelete({ dni });

    if (!eliminado) {
      return res.status(404).json({ msg: "No se encontró un inscripto con ese DNI" });
    }

    res.json({ msg: "Inscripto eliminado correctamente", eliminado });
  } catch (err) {
    next(err);
  }
};




