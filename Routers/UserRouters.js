const express = require("express");
const { signup, signin, AuthUser } = require("../Controllers/UserController");
const { AuthMiddleware } = require("../Middleware/AuthMiddleware");
const router = express.Router();


// SIGN UP
router.post("/signup", signup);


// SIGN IN
router.post("/signin", signin);


// Authorization
router.get("/auth", AuthMiddleware, AuthUser);


module.exports = router;