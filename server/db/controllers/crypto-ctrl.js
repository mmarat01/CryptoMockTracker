const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();

const getAllCrypto = (req, res) => {
  axios
    .get(
      `https://api.nomics.com/v1/currencies/ticker?key=${process.env.API_KEY}&interval=1d,30d&per-page=50&page=1`
    )
    .then((response) => {
      return res.status(200).json({ success: true, data: response.data });
    });
};

module.exports = { getAllCrypto };
