// Message routes for chat-related endpoints
import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  sendMessage,
  getMessagesWithUser,
  getMessageContacts,
} from "../controllers/message.controller.js";

const router = express.Router();

// Fetch message contacts for current user.
router.get("/contacts", protectRoute, getMessageContacts);
// Send a new message.
router.post("/", protectRoute, sendMessage);
// Fetch chat history with specific user.
router.get("/user/:userId", protectRoute, getMessagesWithUser);

export default router;
