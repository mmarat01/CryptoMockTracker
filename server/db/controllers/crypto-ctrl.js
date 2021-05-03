const dotenv = require("dotenv");
const axios = require("axios");
const { readyState } = require("..");

dotenv.config();

const getAllCrypto = (req, res) => {
  axios
    .get(
      `https://api.nomics.com/v1/currencies/ticker?key=${process.env.API_KEY}&interval=1d,30d&convert=EUR&per-page=100&page=1`
    )
    .then((response) => res.send(response));
};

module.exports = { getAllCrypto };
