import express from "express";
var router = express.Router();

import { createOffer } from "../controllers/offer.controller.js";
import { protectServiceProviderRoute } from "../middleware/serviceProvider.middleware.js";

router.post("/create", protectServiceProviderRoute, createOffer);

export default router;
