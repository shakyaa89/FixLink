// Auth routes for login, register, and profile endpoints
import express from "express";
var router = express.Router();
import {
  checkAuth,
  changePasswordController,
  completeServiceProviderProfile,
  loginController,
  logoutController,
  registerController,
  updateUserProfile,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

// Public auth route for user registration.
router.post("/register", registerController);

// Public auth route for user login.
router.post("/login", loginController);

// Logout route (client clears token).
router.post("/logout", logoutController);

// Protected route for provider profile completion.
router.put(
  "/service-provider/complete-profile",
  protectRoute,
  completeServiceProviderProfile
);

// Protected route to fetch current auth user.
router.get("/me", protectRoute, checkAuth);

// Protected route for profile field updates.
router.put("/update/user", protectRoute, updateUserProfile);

// Protected route for password change.
router.put("/change-password", protectRoute, changePasswordController);

export default router;
