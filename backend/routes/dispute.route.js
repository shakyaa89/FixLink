// Dispute routes for listing and creating disputes
import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createDispute,
  getDisputableJobs,
  getMyDisputes,
} from "../controllers/dispute.controller.js";

const router = express.Router();

// Fetch disputes created by current user.
router.get("/my", protectRoute, getMyDisputes);
// Fetch jobs eligible for dispute creation.
router.get("/jobs", protectRoute, getDisputableJobs);
// Create a new dispute on an eligible job.
router.post("/create", protectRoute, createDispute);

export default router;