// AI routes for chat and verification APIs
import express from "express";
import { chatWithAi, verifyJob, verifyServiceProvider } from "../controllers/ai.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Protected AI chat route.
router.post("/chat", protectRoute, chatWithAi);

// AI route for provider document verification.
router.post("/verify", verifyServiceProvider)

// AI route for posted job validation.
router.post("/verifyJob", verifyJob)


export default router;
