const dotenv = require("dotenv");
const axios = require("axios");
const { readyState } = require("..");

dotenv.config();

const getAllCrypto = (req, res) => {
  axios
    .get(
      `https://api.nomics.com/v1/currencies/ticker?key=${process.env.API_KEY}&interval=1d,30d&convert=EUR&per-page=50&page=1`
    )
    .then((response) => {
      console.log(response);
      return res.status(200).json({ success: true, data: response.data });
    });
};

module.exports = { getAllCrypto };
