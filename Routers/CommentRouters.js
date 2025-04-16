const express = require("express");
const { CreateCommentController, GetAllCommentsController, GetSingleCommentController, UpdateCommentController, DeleteCommentController, GetReplyController } = require("../Controllers/CommentController");
const { AuthMiddleware } = require("../Middleware/AuthMiddleware");
const router = express.Router();


// POST COMMENT
router.post("/add-comment", AuthMiddleware, CreateCommentController);


// GET BLOG ALL COMMENTS 
router.post("/get-blog-comments", GetAllCommentsController);


// GET SINGLE COMMENT
router.get("/get-comment/:id", GetSingleCommentController);


// Update COMMENT
router.put("/update-comment/:id", AuthMiddleware, UpdateCommentController);


// DELETE COMMENT
router.post("/delete-comment", AuthMiddleware, DeleteCommentController);

//get-reply
router.post("/get-replies", GetReplyController);

module.exports = router;