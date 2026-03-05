import express from "express";
import { chatWithAi, verifyJob, verifyServiceProvider } from "../controllers/ai.controller.js";

const router = express.Router();

router.post("/chat", chatWithAi);

router.post("/verify", verifyServiceProvider)

router.post("/verifyJob", verifyJob)


export default router;
