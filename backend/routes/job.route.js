import express from "express";
var router = express.Router();

import { protectRoute } from "../middleware/auth.middleware.js";
import { createJob, getUserJobs } from "../controllers/jobs.controller.js";

router.post("/create", protectRoute, createJob);

router.get("/fetch-user-jobs", protectRoute, getUserJobs);

export default router;
