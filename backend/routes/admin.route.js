import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";
import {
  getAdminDisputes,
  getAdminJobs,
  getAdminOverview,
  getAdminUsers,
  getAdminServiceProviders,
  updateServiceProviderVerification,
} from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/overview", protectRoute, requireAdmin, getAdminOverview);
router.get("/users", protectRoute, requireAdmin, getAdminUsers);
router.get("/jobs", protectRoute, requireAdmin, getAdminJobs);
router.get("/disputes", protectRoute, requireAdmin, getAdminDisputes);
router.get(
  "/service-providers",
  protectRoute,
  requireAdmin,
  getAdminServiceProviders
);
router.put(
  "/service-providers/:providerId/verification",
  protectRoute,
  requireAdmin,
  updateServiceProviderVerification
);

export default router;
