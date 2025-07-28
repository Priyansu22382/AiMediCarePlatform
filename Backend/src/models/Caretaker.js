const mongoose = require("mongoose");
const BaseUser = require("./User");

const caretakerSchema = new mongoose.Schema({
  assignedPatients: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  relationship: { type: String },
});

const Caretaker = BaseUser.discriminator("caretaker", caretakerSchema);
module.exports = Caretaker;
