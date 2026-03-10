import express from "express";
var router = express.Router();

import { acceptOffer, createOffer } from "../controllers/offer.controller.js";
import { protectServiceProviderRoute, requireVerifiedProvider } from "../middleware/serviceProvider.middleware.js";
import { protectRoute } from "../middleware/auth.middleware.js";

router.post("/create", protectServiceProviderRoute, requireVerifiedProvider, createOffer);

router.put("/accept", protectRoute, acceptOffer);

export default router;
