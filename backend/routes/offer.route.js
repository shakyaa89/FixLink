import express from "express";
var router = express.Router();

import { acceptOffer, createOffer } from "../controllers/offer.controller.js";
import { protectServiceProviderRoute } from "../middleware/serviceProvider.middleware.js";
import { protectRoute } from "../middleware/auth.middleware.js";

router.post("/create", protectServiceProviderRoute, createOffer);

router.put("/accept", protectRoute, acceptOffer);

export default router;
