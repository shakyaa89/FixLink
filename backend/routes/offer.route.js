// Offer routes for creating and accepting offers
import express from "express";
var router = express.Router();

import { acceptOffer, createOffer } from "../controllers/offer.controller.js";
import { protectServiceProviderRoute, requireVerifiedProvider } from "../middleware/serviceProvider.middleware.js";
import { protectRoute } from "../middleware/auth.middleware.js";

// Verified provider route to create offer.
router.post("/create", protectServiceProviderRoute, requireVerifiedProvider, createOffer);

// Job owner route to accept an offer.
router.put("/accept", protectRoute, acceptOffer);

export default router;
