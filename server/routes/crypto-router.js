//set up and export controller funcs with express router
const express = require("express");
const cryptoCtrl = require("../db/controllers/crypto-ctrl");
const router = express.Router();

router.get("/all", cryptoCtrl.getAllCrypto);

module.exports = router;
