import fs from "fs";
import path from "path";

export const guardarContenido = (req, res) => {
  try {
    const { paginaDestino, contenido } = req.body;

    if (!paginaDestino || !contenido) {
      return res.status(400).json({ msg: "Faltan datos" });
    }

    const ruta = path.join("db", `${paginaDestino}.json`);

    fs.writeFileSync(ruta, JSON.stringify(contenido, null, 2));

    return res.json({ msg: "Contenido guardado correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error interno" });
  }
};
