const express = require("express");
const { signup, signin, AuthUser, SearchUserController, GetProfileController, ChangPasswordController, UpdateImgController, UpdateProfileController, NtfcnController, AllntfcnController, NtfcnCountController } = require("../Controllers/UserController");
const { AuthMiddleware } = require("../Middleware/AuthMiddleware");
const router = express.Router();


// SIGN UP
router.post("/signup", signup);


// SIGN IN
router.post("/signin", signin);


// Authorization
router.get("/auth", AuthMiddleware, AuthUser);

//Search User
router.post("/search-user", SearchUserController);

// Get profile 
router.post("/get-profile", GetProfileController);

// Change password
router.post("/change-password", AuthMiddleware, ChangPasswordController);

// Update profile image
router.post("/update-profile-image", AuthMiddleware, UpdateImgController);

// Update profile
router.post("/update-profile", AuthMiddleware, UpdateProfileController);


// New notification
router.get("/new-notification", AuthMiddleware, NtfcnController);


// Notifications
router.post("/notifications", AuthMiddleware, AllntfcnController);


// Notification Count
router.post("/all-notifications-count", AuthMiddleware, NtfcnCountController);


module.exports = router;