// Review routes for sending and fetching reviews
import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createReview,
  getMyReceivedReviews,
  getMySentReviews,
} from "../controllers/review.controller.js";

const router = express.Router();

// Create review after eligible completed job.
router.post("/create", protectRoute, createReview);
// Fetch reviews received by current user.
router.get("/received", protectRoute, getMyReceivedReviews);
// Fetch reviews sent by current user.
router.get("/sent", protectRoute, getMySentReviews);

export default router;
