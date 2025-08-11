const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors"); // ✅ Import CORS
const connectDB = require("./config/db");
const scheduleReminders = require("./utils/reminderSchedule");

// Route imports
const medicationRoutes = require("./routes/medicationRoutes");
const adherenceRoutes = require("./routes/adherenceRoutes");
const testRoute = require("./routes/testRoute");
const caretakerRoutes = require("./routes/caretakerRoutes");
const authRoutes = require("./routes/authRoutes");


dotenv.config();

connectDB();
scheduleReminders();

// ✅ CORS Setup
app.use(cors({
  origin: "https://aimedicare.netlify.app", // Replace with your frontend URL
  credentials: true,
}));


app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/medication", medicationRoutes);
app.use("/api/adherence", adherenceRoutes);
app.use("/api/test", testRoute);
app.use("/api/caretaker", caretakerRoutes);



const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));