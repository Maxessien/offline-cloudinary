import express from "express";
import { viewImage } from "../controllers/fileControllers.js";

const router = express.Router()

router.get("/:id", viewImage)

export default router