import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createReview,
  getMyReceivedReviews,
  getMySentReviews,
} from "../controllers/review.controller.js";

const router = express.Router();

router.post("/create", protectRoute, createReview);
router.get("/received", protectRoute, getMyReceivedReviews);
router.get("/sent", protectRoute, getMySentReviews);

export default router;
