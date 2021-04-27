const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const auth = (req, res, next) => {
  const authHeader = req.headers["auth-token"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, _id) => {
    if (err) return res.sendStatus(403);
    req._id = _id;
    next();
  });
};

module.exports = auth;
