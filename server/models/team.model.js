const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: "Name is required!",
  },
  _id: {
    type: String,
    required: "Id is required!",
  },
});

module.exports = mongoose.model("Team", teamSchema);
