import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  sendMessage,
  getMessagesWithUser,
  getMessageContacts,
} from "../controllers/message.controller.js";

const router = express.Router();

router.get("/contacts", protectRoute, getMessageContacts);
router.post("/", protectRoute, sendMessage);
router.get("/user/:userId", protectRoute, getMessagesWithUser);

export default router;
