import Taller from "../models/Taller.js";

export const createTaller = async (req, res, next) => {
  try {
    const { nombre, descripcion, cupo, diasHorarios } = req.body;
    const parsed = diasHorarios ? JSON.parse(diasHorarios) : [];
    const newT = await Taller.create({ nombre, descripcion, cupo: Number(cupo) || undefined, diasHorarios: parsed });
    res.status(201).json(newT);
  } catch (err) { next(err); }
};

export const getTalleres = async (req, res, next) => {
  try {
    const talleres = await Taller.find().sort({ nombre: 1 });
    res.json(talleres);
  } catch (err) { next(err); }
};

export const deleteTaller = async (req, res, next) => {
  try {
    await Taller.findByIdAndDelete(req.params.id);
    res.json({ msg: "Taller eliminado" });
  } catch (err) { next(err); }
};
