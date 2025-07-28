const jwt = require("jsonwebtoken");
const User = require("../models/User"); // This is the base model used for all roles (discriminator)

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ message: "Not authorized, token missing!" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { id, role } = decoded;

    // Fetch user regardless of role from the base User collection
    const user = await User.findById(id).select("-password");

    if (!user || user.role !== role) {
      return res.status(401).json({ message: "User not found or role mismatch!" });
    }

    req.user = user;          // Attach full user document
    req.user.role = role;     // Attach role for RBAC checks
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    return res.status(401).json({ message: "Not authorized" });
  }
};

module.exports = authMiddleware;


