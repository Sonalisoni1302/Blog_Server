const { CreateBlogController, GetAllBlogsController, UpdateBlogController, DeleteBlogController, GetUserBlogsController } = require("../Controllers/BlogController");

const express = require("express");
const router = express.Router();

// CREATE NEW BLOG
router.post("/create-blog", CreateBlogController);

// GET ALL BLOGS
router.get("/get-all-blogs", GetAllBlogsController);

// GET USER BLOGS
router.get("/user-blogs/:id", GetUserBlogsController);

// UPDATE BLOG
router.put("/update-blog/:id", UpdateBlogController);

// DELETE BLOG
router.delete("/delete-blog/:id", DeleteBlogController);

module.exports = router;