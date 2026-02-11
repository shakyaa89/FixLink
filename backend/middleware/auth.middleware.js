import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { isServiceProviderProfileComplete } from "./serviceProvider.middleware.js";

export async function protectRoute(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "User not authorized!" });
    }

    const verifyToken = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if (!verifyToken) {
      return res.status(401).json({ message: "Token Invalid!" });
    }

    const user = await User.findById(verifyToken.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    const isCompletionEndpoint = req.originalUrl?.includes(
      "/auth/service-provider/complete-profile"
    );
    const isMeEndpoint = req.originalUrl?.includes("/auth/me");

    if (
      user.role === "serviceProvider" &&
      !isServiceProviderProfileComplete(user) &&
      !isCompletionEndpoint &&
      !isMeEndpoint
    ) {
      return res.status(403).json({
        message: "Complete your service provider profile to continue",
        profileIncomplete: true,
      });
    }

    req.user = user;

    next();
  } catch (err) {
    console.log(err);
    return res.status(401).json({ message: "Token verification failed" });
  }
}
