// Job routes for job lifecycle endpoints
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
  scheduleJob,
  updateJobByUser,
} from "../controllers/jobs.controller.js";
import { protectServiceProviderRoute, requireVerifiedProvider } from "../middleware/serviceProvider.middleware.js";

// User route to create an open job.
router.post("/create", protectRoute, createJob);

// User route to fetch own jobs.
router.get("/fetch-user-jobs", protectRoute, getJobsbyUserId);

// User route to fetch all jobs.
router.get("/fetch-all-jobs", protectRoute, getJobs);

// User route to create a scheduled job.
router.post("/schedule", protectRoute, scheduleJob);

// User route to fetch one job by id.
router.get("/fetch/:id", protectRoute, getJobById);

// Provider route to fetch matching jobs.
router.get("/provider", protectServiceProviderRoute, getJobsForProvider);

// User route to update own editable job.
router.put("/update/:id", protectRoute, updateJobByUser);

// User route to cancel own job.
router.put("/cancel/:id", protectRoute, cancelJob);

// Verified provider route to complete job.
router.put("/complete/:id", protectServiceProviderRoute, requireVerifiedProvider, completeJob);

export default router;
