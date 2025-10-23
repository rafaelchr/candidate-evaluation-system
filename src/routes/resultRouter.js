import express from "express";
import { resultById } from "../controllers/resultController.js";

const router = express.Router();
router.get("/:id", resultById);
export default router;