import express from "express";
var router = express.Router();

import { protectRoute } from "../middleware/auth.middleware.js";
import {
  cancelJob,
  completeJob,
  createJob,
  getJobById,
  getJobs,
  getJobsbyUserId,
  getJobsForProvider,
} from "../controllers/jobs.controller.js";
import { protectServiceProviderRoute } from "../middleware/serviceProvider.middleware.js";

router.post("/create", protectRoute, createJob);

router.get("/fetch-user-jobs", protectRoute, getJobsbyUserId);

router.get("/fetch-all-jobs", protectRoute, getJobs);

router.get("/fetch/:id", protectRoute, getJobById);

router.get("/provider", protectServiceProviderRoute, getJobsForProvider);

router.put("/cancel/:id", protectRoute, cancelJob);

router.put("/complete/:id", protectServiceProviderRoute, completeJob);

export default router;
