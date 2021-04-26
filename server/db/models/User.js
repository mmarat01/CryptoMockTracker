// user
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const User = new Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  holdings: [
    { name: String, ticker: String, amount: Number, purchase_time: Date },
  ],
});

module.exports = mongoose.model("users", User);
