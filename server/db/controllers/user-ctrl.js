// route functions to manipulate users
const User = require("../models/user-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
/* 

  TEST USERS
  
    USERNAME: mijael@a.com
    PASSWORD: madrid

    USERNAME: john@yahoo.com
    PASSWORD: fountain

*/
const register = (req, res) => {
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
        let date_ob = new Date()
        let date = ("0" + date_ob.getDate()).slice(-2);
        let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
        let year = date_ob.getFullYear();
        user.statistics = {
          net_change: 0,
          total_transactions: 0,
          user_since: month + "/" + date + "/" + year
        }
        user
          .save()
          .then(() => {
            res.redirect('/');
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
        .header("authorization", token)
        .status(200)
        .json({ success: true, message: "logged in!" });
    });
  });
};

const getUser = (req, res) => {
  User.findOne({ _id: new mongoose.Types.ObjectId(req.body._id) }).then(
    (user) => {
      if (!user)
        return res
          .status(400)
          .json({ success: false, message: "user does not exist" });

      return res.status(200).json({
        sucess: true,
        data: { 
          username: user.username, 
          holdings: user.holdings, 
          statistcs: user.statistics },
      });
      f;
    }
  );
};

const addHolding = (req, res) => {
  const { name, ticker, purchase_price } = req.body;
  User.findOne({
    _id: new mongoose.Types.ObjectId(req.body._id),
  }).then((user) => {
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "user does not exist" });
    let holding = {
      name: name,
      ticker: ticker,
      purchase_price: purchase_price
    }
    user.holdings.push(holding)
    user.statistics.total_transactions += 1

    user
      .save()
      .then(() => {
        return res.status(200).json({
          success: true,
          message: "user holdings updated",
        });
      })
      .catch((err) => {
        console.log(err)
        return res
          .status(400)
          .json({ success: false, message: "could not update user holdings" });
      });
  });
};

const sellHolding = (req, res) => {
  const { name, ticker, purchase_price, percent_change } = req.body;
  User.findOne({
    _id: new mongoose.Types.ObjectId(req.body._id),
  }).then((user) => {
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "user does not exist" });

    let remove_idx = -1
    for (let i = 0; i < user.holdings.length; i++) {
      let holding = user.holdings[i]
      if (holding.name == name && holding.purchase_price == purchase_price) {
        remove_idx = i
        break
      }
    }

    if (remove_idx >= 0) {
      user.statistics.total_transactions += 1
      user.statistics.net_change += percent_change
      user.holdings.splice(remove_idx, 1)
      user
        .save()
        .then(() => {
          return res.status(200).json({
            success: true,
            message: "user holdings updated",
          });
        })
        .catch((err) => {
          console.log(err)
          return res
            .status(400)
            .json({ success: false, message: "could not update user holdings" });
        });
    } else {
      console.log("HOLDING NOT FOUND")
      return res
        .status(400)
        .json({ success: false, message: "could not update user holdings" });
    }
  });

}

module.exports = {
  register,
  login,
  getUser,
  addHolding,
  sellHolding
};
