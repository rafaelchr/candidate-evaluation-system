import express from "express";
import { evaluateCandidate } from "../controllers/evaluateController.js";

const router = express.Router();
router.post("/", evaluateCandidate);
export default router;
