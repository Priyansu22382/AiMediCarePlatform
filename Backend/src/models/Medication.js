const mongoose = require("mongoose");

const medicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true }, // e.g., "once a day"
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  caretaker: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional
  reminders: [{ type: String }] // e.g., ["08:00", "20:00"]
}, { timestamps: true });

const Medication = mongoose.model("Medication", medicationSchema);
module.exports = Medication;
