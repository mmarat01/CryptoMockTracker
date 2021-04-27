//set up and export controller funcs with express router
const express = require("express");
const { verify } = require("jsonwebtoken");
const userCtrl = require("../db/controllers/user-ctrl");
const router = express.Router();

router.post("/register", userCtrl.register);
router.post("/login", userCtrl.login);

module.exports = router;
