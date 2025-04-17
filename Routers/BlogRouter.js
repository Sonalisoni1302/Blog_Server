const { CreateBlogController, GetAllBlogsController, UpdateBlogController, DeleteBlogController, GetUserBlogsController, GetLetestBlogsController, GetTrendingBlogsController, SearchBlogController, GetallLatestBlogsCount, searchBlogCount, GetBlogController, GetUserBlogsCountController } = require("../Controllers/BlogController");

const express = require("express");
const { AuthMiddleware } = require("../Middleware/AuthMiddleware");
const router = express.Router();

// CREATE NEW BLOG
router.post("/create-blog", AuthMiddleware, CreateBlogController);


// GET Latest BLOGS
router.post("/latest-blogs", GetLetestBlogsController);


// All LATEST BLOG COUNT
router.post("/all-latest-blogs-count", GetallLatestBlogsCount);


// GET TRENDING BLOGS
router.post("/trending-blogs", GetTrendingBlogsController);


// GET USER BLOGS
router.post("/user-blogs", AuthMiddleware, GetUserBlogsController);
router.post("/user-blogs-count", AuthMiddleware, GetUserBlogsCountController);


// SERCH BLOGS
router.post("/search-blogs", SearchBlogController);
router.post("/search-blogs-count", searchBlogCount);


// UPDATE BLOG
router.put("/update-blog/:id", AuthMiddleware, UpdateBlogController);


// DELETE BLOG
router.post("/delete-blog", AuthMiddleware, DeleteBlogController);

// GET BLOG
router.post("/get-blog", GetBlogController);


module.exports = router;