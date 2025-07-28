const User = require("../models/User");
const Patient = require("../models/Patient");
const Caretaker = require("../models/Caretaker");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");

const registerUser = async (req, res) => {
  const { name, email, password, contactNumber, age, role } = req.body;

  if (!name || !email || !password || !contactNumber || !role) {
    return res.status(400).json({ message: "Please fill all required fields" });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    let newUser;

    if (role === "caretaker") {
      newUser = new Caretaker({ name, email, password: hashedPassword, contactNumber, role });
    } else if (role === "patient") {
      newUser = new Patient({ name, email, password: hashedPassword, contactNumber, age, role });
    } else {
      newUser = new User({ name, email, password: hashedPassword, contactNumber, age, role });
    }

    await newUser.save();
    generateToken(newUser._id, newUser.role, res);

    res.status(201).json({
      success: true,
      message: `${role} registered successfully`,
      role: newUser.role,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        contactNumber: newUser.contactNumber,
        age: newUser.age,
        role: newUser.role,
      }
    });
  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};


const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Please fill all fields" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    generateToken(user._id, user.role, res);

    res.status(200).json({
      success: true,
      message: `${user.role} logged in successfully`,
      role: user.role,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        contactNumber: user.contactNumber,
        age: user.age,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const logoutUser = (req,res) => {
    try{
        res.cookie("jwt","",{maxAge : 0});
        res.status(200).json({message : "Logged Out Successfully."});
    }
    catch(error){
        console.log("Error in User LogOut : "+error.message);
        res.status(500).json({message : "Internal Server Error!!"});
    }
}

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
};