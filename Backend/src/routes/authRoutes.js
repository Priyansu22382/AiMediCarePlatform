const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  logoutUser,
} = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddlewares");
const User = require("../models/User");
const Patient = require("../models/Patient");

// PUBLIC Routes
router.post("/register", registerUser); // patient / caretaker / admin
router.post("/login", loginUser);

// PROTECTED Route
router.post("/logout", authMiddleware, logoutUser);

router.get("/me", authMiddleware, async (req, res) => {
  try {
    let user;

    if (req.user.role === "patient") {
      user = await Patient.findById(req.user._id)
        .populate("caretaker", "name email contactNumber age")
        .select("-password"); // remove password from response
    } else {
      user = await User.findById(req.user._id).select("-password");
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
    console.log("req.user:", req.user);
    console.log("Caretaker Name:", user?.caretaker?.name);
  } catch (err) {
    console.error("Error in /me:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


module.exports = router;
