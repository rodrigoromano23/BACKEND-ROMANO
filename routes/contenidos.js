import express from "express";
import { guardarContenido } from "../controllers/contenidosController.js";

const router = express.Router();

router.post("/", guardarContenido);

export default router;
