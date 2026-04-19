// Middleware to protect routes using JWT auth
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { isServiceProviderProfileComplete } from "./serviceProvider.middleware.js";

export async function protectRoute(req, res, next) {
  try {
    // Read bearer token from Authorization header.
    const token = req.headers.authorization?.split(" ")[1];

    // Block requests without token.
    if (!token) {
      return res.status(401).json({ message: "User not authorized!" });
    }

    // Verify and decode JWT payload.
    const verifyToken = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if (!verifyToken) {
      return res.status(401).json({ message: "Token Invalid!" });
    }

    // Load authenticated user without password.
    const user = await User.findById(verifyToken.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    // Allow profile completion and basic auth endpoints.
    const isCompletionEndpoint = req.originalUrl?.includes(
      "/auth/service-provider/complete-profile"
    );
    const isMeEndpoint = req.originalUrl?.includes("/auth/me");
    const isChangePasswordEndpoint = req.originalUrl?.includes(
      "/auth/change-password"
    );

    // Block incomplete providers from other protected routes.
    if (
      user.role === "serviceProvider" &&
      !isServiceProviderProfileComplete(user) &&
      !isCompletionEndpoint &&
      !isMeEndpoint &&
      !isChangePasswordEndpoint
    ) {
      return res.status(403).json({
        message: "Complete your service provider profile to continue",
        profileIncomplete: true,
      });
    }

    // Attach user and continue request flow.
    req.user = user;

    next();
  } catch (err) {
    console.log(err);
    return res.status(401).json({ message: "Token verification failed" });
  }
}
