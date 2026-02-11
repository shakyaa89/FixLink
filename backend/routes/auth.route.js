import express from "express";
var router = express.Router();
import {
  checkAuth,
  completeServiceProviderProfile,
  loginController,
  logoutController,
  registerController,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

router.post("/register", registerController);

router.post("/login", loginController);

router.post("/logout", logoutController);

router.put(
  "/service-provider/complete-profile",
  protectRoute,
  completeServiceProviderProfile
);

router.get("/me", protectRoute, checkAuth);

export default router;
