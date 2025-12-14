import Seccion from "../models/Seccion.js";

export const createSeccion = async (req, res, next) => {
  try {
    const { tipo, titulo, descripcion, plantilla, links } = req.body;
    const media = (req.files || []).map(f => `/uploads/${f.filename}`);
    const slug = (titulo || tipo || "seccion").toLowerCase().replace(/\s+/g, "-");
    const newS = await Seccion.create({
      tipo, titulo, descripcion, plantilla: Number(plantilla) || 1, media, links: links ? JSON.parse(links) : [], slug, createdBy: req.user._id
    });
    res.status(201).json(newS);
  } catch (err) { next(err); }
};

export const getSecciones = async (req, res, next) => {
  try {
    const { tipo, publicOnly } = req.query;
    const q = {};
    if (tipo) q.tipo = tipo;
    if (publicOnly === "true") q.visible = true;
    const data = await Seccion.find(q).sort({ createdAt: -1 });
    res.json(data);
  } catch (err) { next(err); }
};

export const getSeccionBySlug = async (req, res, next) => {
  try {
    const s = await Seccion.findOne({ slug: req.params.slug });
    if (!s) return res.status(404).json({ msg: "No encontrada" });
    res.json(s);
  } catch (err) { next(err); }
};

export const deleteSeccion = async (req, res, next) => {
  try {
    await Seccion.findByIdAndDelete(req.params.id);
    res.json({ msg: "Sección eliminada" });
  } catch (err) { next(err); }
};
