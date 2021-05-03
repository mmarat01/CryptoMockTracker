//set up and export controller funcs with express router
const express = require("express");
const userCtrl = require("../db/controllers/user-ctrl");
const auth = require("../utils/auth");
const router = express.Router();

router.post("/register", userCtrl.register);
router.post("/login", userCtrl.login);
router.post("/holdings/add", auth, userCtrl.addHolding);

router.get("/", auth, userCtrl.getUser);
/*
     1.
 */
module.exports = router;
