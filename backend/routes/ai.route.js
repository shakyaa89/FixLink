import express from "express";
import { chatWithAi, verifyJob, verifyServiceProvider } from "../controllers/ai.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/chat", protectRoute, chatWithAi);

router.post("/verify", verifyServiceProvider)

router.post("/verifyJob", verifyJob)


export default router;
