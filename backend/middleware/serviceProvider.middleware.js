// Middleware for service provider access and checks
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

export async function protectServiceProviderRoute(req, res, next) {
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

    // Load user and ensure role is service provider.
    const user = await User.findById(verifyToken.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    if (user.role !== "serviceProvider") {
      return res.status(401).json({ message: "User not authorized!" });
    }

    // Require complete provider profile before access.
    if (!isServiceProviderProfileComplete(user)) {
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

export function isServiceProviderProfileComplete(user) {
  // Check user exists.
  // Ensure role is service provider.
  // Require all mandatory provider profile fields.
  return Boolean(
    user &&
    user.role === "serviceProvider" &&
    user.verificationProofURL &&
    user.idProofURL &&
    user.providerCategory &&
    user.address
  );
}

export function requireVerifiedProvider(req, res, next) {
  // Read authenticated user from request.
  const user = req.user;

  // Allow only service provider role.
  if (!user || user.role !== "serviceProvider") {
    return res.status(403).json({ message: "Service Provider access required" });
  }

  // Require verified status for restricted actions.
  if (user.verificationStatus !== "verified") {
    return res.status(403).json({ message: "You have to be verified to complete this action!" })
  }

  // Continue to next middleware.
  next();
}
