const express = require("express");
const { CreateCommentController, GetAllCommentsController, GetSingleCommentController, UpdateCommentController, DeleteCommentController } = require("../Controllers/CommentController");
const router = express.Router();


// POST COMMENT
router.post("/post-comment", CreateCommentController);


// GET BLOG ALL COMMENTS 
router.get("/get-comments/:id", GetAllCommentsController);


// GET SINGLE COMMENT
router.get("/get-comment/:id", GetSingleCommentController);


// Update COMMENT
router.put("/update-comment/:id", UpdateCommentController);


// DELETE COMMENT
router.delete("/delete-comment/:id", DeleteCommentController);

module.exports = router;