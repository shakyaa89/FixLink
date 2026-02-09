import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createReview,
  getMyReceivedReviews,
} from "../controllers/review.controller.js";

const router = express.Router();

router.post("/create", protectRoute, createReview);
router.get("/received", protectRoute, getMyReceivedReviews);

export default router;
