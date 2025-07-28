const mongoose = require("mongoose");
const BaseUser = require("./User");
const patientSchema = new mongoose.Schema({
  medicalHistory: { type: String },

  medications: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Medication" }
  ],
  caretaker: { type: mongoose.Schema.Types.ObjectId, ref: "caretaker" },
});

const Patient = BaseUser.discriminator("patient", patientSchema);
module.exports = Patient;
