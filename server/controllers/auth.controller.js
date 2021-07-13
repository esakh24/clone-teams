const db = require("../models");
const config = require("../config/auth.config");
const mongoose = require("mongoose");
const Team = db.team;
const User = mongoose.model("User");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
// create new User in database
exports.signup = async (req, res) => {
  // Save User to Database

  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),
  });

  await user.save();
  res.send({ message: "User was registered successfully!" });
};

exports.signin = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({
    email,
  });

  if (!user) {
    return res.status(404).send({ message: "User Not found." });
  }
  var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);

  if (!passwordIsValid) {
    return res.status(401).send({
      accessToken: null,
      message: "Invalid Password!",
    });
  }

  var token = jwt.sign({ id: user.id }, config.secret, {
    expiresIn: 86400, //seconds
  });

  res.status(200).send({
    id: user.id,
    username: user.username,
    email: user.email,
    accessToken: token,
  });
};
