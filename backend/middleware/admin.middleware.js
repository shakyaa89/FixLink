// Middleware to allow only admin users
export function requireAdmin(req, res, next) {
  // Read authenticated user from request.
  const user = req.user;

  // Allow only users with admin role.
  if (!user || user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  // Continue to next middleware/handler.
  next();
}
