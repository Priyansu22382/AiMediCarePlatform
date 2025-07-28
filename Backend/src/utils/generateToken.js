const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const generateToken = (userId, role, res) => {
  const token = jwt.sign(
    { id: userId, role }, // ✅ match with what frontend expects
    process.env.JWT_SECRET,
    { expiresIn: "3d" }
  );

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: true, // ⬅️ only set true in production
    sameSite: "None",
    maxAge: 3 * 24 * 60 * 60 * 1000,
  });

  return token;
};

module.exports = generateToken;
