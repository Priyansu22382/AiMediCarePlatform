const mongoose = require("mongoose");

const adherenceLogSchema = new mongoose.Schema({
  medication: { type: mongoose.Schema.Types.ObjectId, ref: "Medication", required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["taken", "missed"], required: true },
  takenAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("AdherenceLog", adherenceLogSchema);