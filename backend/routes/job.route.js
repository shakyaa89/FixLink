import express from "express";
var router = express.Router();

import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createJob,
  getJobs,
  getJobsbyUserId,
} from "../controllers/jobs.controller.js";

router.post("/create", protectRoute, createJob);

router.get("/fetch-user-jobs", protectRoute, getJobsbyUserId);

router.get("/fetch-all-jobs", protectRoute, getJobs);

export default router;
