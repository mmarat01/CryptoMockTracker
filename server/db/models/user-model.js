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
    {
      name: String,
      ticker: String,
      purchase_price: Number
    },
  ],
  statistics: {
    net_change: Number,
    total_transactions: Number,
    user_since: Date
  }
});

module.exports = mongoose.model("users", User);

// HOMEPAGE
/*************************************
     
  NAME 

  ticker                    [ADD BUTTON]
 ***************************************/

// PROFILE
/*************************************
     
  NAME (ticker)                   Amount

  Acquired: time            [DEL BUTTON]
 ***************************************/
