import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";
import {
  createAdminJob,
  deleteAdminDispute,
  deleteAdminJob,
  deleteAdminMessage,
  deleteAdminOffer,
  deleteAdminReview,
  deleteAdminUser,
  getAdminDisputes,
  getAdminJobs,
  getAdminJobById,
  getAdminMessages,
  getAdminOverview,
  getAdminOffers,
  getAdminReviews,
  getAdminUserById,
  getAdminUsers,
  getAdminServiceProviders,
  updateAdminDispute,
  updateAdminJob,
  updateAdminMessage,
  updateAdminOffer,
  updateAdminReview,
  updateAdminUser,
  updateServiceProviderVerification,
} from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/overview", protectRoute, requireAdmin, getAdminOverview);
router.get("/users", protectRoute, requireAdmin, getAdminUsers);
router.get("/users/:userId", protectRoute, requireAdmin, getAdminUserById);
router.put("/users/:userId", protectRoute, requireAdmin, updateAdminUser);
router.delete("/users/:userId", protectRoute, requireAdmin, deleteAdminUser);

router.get("/jobs", protectRoute, requireAdmin, getAdminJobs);
router.post("/jobs", protectRoute, requireAdmin, createAdminJob);
router.get("/jobs/:jobId", protectRoute, requireAdmin, getAdminJobById);
router.put("/jobs/:jobId", protectRoute, requireAdmin, updateAdminJob);
router.delete("/jobs/:jobId", protectRoute, requireAdmin, deleteAdminJob);

router.get("/offers", protectRoute, requireAdmin, getAdminOffers);
router.put("/offers/:offerId", protectRoute, requireAdmin, updateAdminOffer);
router.delete("/offers/:offerId", protectRoute, requireAdmin, deleteAdminOffer);

router.get("/disputes", protectRoute, requireAdmin, getAdminDisputes);
router.put(
  "/disputes/:disputeId",
  protectRoute,
  requireAdmin,
  updateAdminDispute
);
router.delete(
  "/disputes/:disputeId",
  protectRoute,
  requireAdmin,
  deleteAdminDispute
);

router.get("/reviews", protectRoute, requireAdmin, getAdminReviews);
router.put(
  "/reviews/:reviewId",
  protectRoute,
  requireAdmin,
  updateAdminReview
);
router.delete(
  "/reviews/:reviewId",
  protectRoute,
  requireAdmin,
  deleteAdminReview
);

router.get("/messages", protectRoute, requireAdmin, getAdminMessages);
router.put(
  "/messages/:messageId",
  protectRoute,
  requireAdmin,
  updateAdminMessage
);
router.delete(
  "/messages/:messageId",
  protectRoute,
  requireAdmin,
  deleteAdminMessage
);

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
