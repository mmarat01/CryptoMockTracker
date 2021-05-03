const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const auth = (req, res, next) => {
  const authHeader = req.headers["authorization"]; // req.authorization --> Bearer [token]
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.sendStatus(401);
  }

  console.log(token)

  jwt.verify(token, process.env.TOKEN_SECRET, (err, result) => {
    if (err) {
      console.log(err)
      return res.sendStatus(403);
    }
    req.body._id = result._id;
    console.log(req.body._id);
    next();
  });
};

module.exports = auth;
