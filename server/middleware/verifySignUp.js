const mongoose = require("mongoose");
const Team = mongoose.model("Team");
const User = mongoose.model("User");

checkDuplicateUsernameOrEmail = (req, res, next) => {
  // only Email
  User.findOne({
    where: {
      email: req.body.email,
    },
  }).then((user) => {
    if (user) {
      res.status(400).send({
        message: "Failed! Email is already in use! You might try signing in!!",
      });
      return;
    }

    next();
  });
};

const verifySignUp = {
  checkDuplicateUsernameOrEmail: checkDuplicateUsernameOrEmail,
};

module.exports = verifySignUp;
