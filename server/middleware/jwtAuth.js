const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");

// get token from HTTP headers, then use jsonwebtoken's verify() function to verify the claim
verifyToken = (req, res, next) => {
  if (!req.headers.authorization) {
    console.log("forbidden");
    throw "Forbidden!!";
  }

  const token = JSON.parse(req.headers.authorization.split(" ")[1]);

  if (!token) {
    return res.status(403).send({
      message: "No token provided!",
    });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Unauthorized!",
      });
    }

    req.userId = decoded.id;
    console.log("token verified");
    next();
  });
};

const jwtAuth = {
  verifyToken: verifyToken,
};
module.exports = jwtAuth;
