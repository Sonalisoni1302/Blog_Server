const express = require("express");
const { CreateCommentController, GetAllCommentsController, GetSingleCommentController, UpdateCommentController, DeleteCommentController } = require("../Controllers/CommentController");
const { AuthMiddleware } = require("../Middleware/AuthMiddleware");
const router = express.Router();


// POST COMMENT
router.post("/post-comment", AuthMiddleware, CreateCommentController);


// GET BLOG ALL COMMENTS 
router.get("/get-comments/:id", GetAllCommentsController);


// GET SINGLE COMMENT
router.get("/get-comment/:id", GetSingleCommentController);


// Update COMMENT
router.put("/update-comment/:id", AuthMiddleware, UpdateCommentController);


// DELETE COMMENT
router.delete("/delete-comment/:id", AuthMiddleware, DeleteCommentController);

module.exports = router;