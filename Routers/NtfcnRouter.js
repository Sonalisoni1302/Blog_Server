const express = require('express');
const { LikeController, isLikeController } = require('../Controllers/NtfcnController');
const { AuthMiddleware } = require("../Middleware/AuthMiddleware");
const router = express.Router();

router.post("/like-blog", AuthMiddleware, LikeController);

router.post("/is-like", AuthMiddleware, isLikeController);

module.exports = router;