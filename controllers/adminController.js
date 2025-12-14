import Inscripto from "../models/Inscripto.js";
import Taller from "../models/Taller.js";
import Seccion from "../models/Seccion.js";

export const getStats = async (req, res, next) => {
  try {
    const alumnos = await Inscripto.countDocuments();
    const talleres = await Taller.countDocuments();
    const secciones = await Seccion.countDocuments();
    res.json({ alumnos, talleres, secciones });
  } catch (err) { next(err); }
};

