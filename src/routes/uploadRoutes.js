import express from "express";
import { uploadFields } from "../middlewares/upload.js";
import { uploadPdfFiles } from "../controllers/uploadController.js";

const router = express.Router();

router.post("/", uploadFields, uploadPdfFiles);

export default router;
