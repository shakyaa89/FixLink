import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

export async function protectServiceProviderRoute(req, res, next) {
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

    if (user.role !== "serviceProvider") {
      return res.status(401).json({ message: "User not authorized!" });
    }

    req.user = user;

    next();
  } catch (err) {
    console.log(err);
    return res.status(401).json({ message: "Token verification failed" });
  }
}
