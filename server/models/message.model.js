const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    teamId: {
      type: String,
      required: "teamid is required!",
    },
    userId: {
      type: String,
      required: "Userid is required!",
    },
    username: {
      type: String,
      required: "Username is required!",
    },
    msg: {
      type: String,
      required: "Message is required!",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Message", messageSchema);
