const express = require("express");
const { signup, signin } = require("../Controllers/UserController");
const router = express.Router();


// SIGN UP
router.post("/signup", signup);


// SIGN IN
router.post("/signin", signin);


module.exports = router;