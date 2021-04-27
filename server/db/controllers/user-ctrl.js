// route functions to manipulate users
const User = require("../models/user-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const dotenv = require("dotenv");
dotenv.config();
/* 

  TEST USERS
  
    USERNAME: mijael@a.com
    PASSWORD: madrid

    USERNAME: john@yahoo.com
    PASSWORD: fountain

*/
const register = async (req, res) => {
  User.findOne({ username: req.body.username }).then((user) => {
    if (user) {
      return res
        .status(400)
        .json({ success: false, message: "username is already in use" });
    } else {
      bcrypt.hash(req.body.password, 10, function (err, hash) {
        if (err)
          return res
            .status(400)
            .json({ success: false, message: "could not save password" });
        const user = new User();
        user.username = req.body.username;
        user.password = hash;
        user
          .save()
          .then(() => {
            return res.status(201).json({
              success: true,
              message: "new User created!",
            });
          })
          .catch((err) => {
            return res
              .status(400)
              .json({ success: false, message: "could not register User" });
          });
      });
    }
  });
};
const login = (req, res) => {
  User.findOne({ username: req.body.username }).then((user) => {
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "user does not exist" });
    bcrypt.compare(req.body.password, user.password, (err, valid) => {
      if (!valid)
        return res
          .status(400)
          .json({ success: false, message: "incorrect password" });

      const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);

      return res
        .header("auth-token", token)
        .status(200)
        .json({ success: true, message: "logged in!" });
    });
  });
};

module.exports = {
  register,
  login,
};
