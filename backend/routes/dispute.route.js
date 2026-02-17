import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createDispute,
  getDisputableJobs,
  getMyDisputes,
} from "../controllers/dispute.controller.js";

const router = express.Router();

router.get("/my", protectRoute, getMyDisputes);
router.get("/jobs", protectRoute, getDisputableJobs);
router.post("/create", protectRoute, createDispute);

export default router;