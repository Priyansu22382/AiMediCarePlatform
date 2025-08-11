const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const options = { discriminatorKey: "role", timestamps: true };

const baseUserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  contactNumber: { type: String, required: true },
  age: { type: Number },
}, options);

const BaseUser = model("User", baseUserSchema);
module.exports = BaseUser;