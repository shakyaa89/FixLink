import express from "express";
import { chatWithAi, verifyServiceProvider } from "../controllers/ai.controller.js";

const router = express.Router();

router.post("/chat", chatWithAi);

router.post("/verify", verifyServiceProvider)

export default router;
