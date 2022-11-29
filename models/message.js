const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
  {
    name: String,
    message: String,
    info: String,
  },
  {
    timestamps: true,
  }
);

const Massage = mongoose.model("Massage", messageSchema);

module.exports = Massage;
