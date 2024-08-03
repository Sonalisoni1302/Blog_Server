const mongoose = require("mongoose");

// <----------------- Schema ------------------->

const CommentSchema = new mongoose.Schema({
    content : {
        type : String,
        required : true
    },
    post_Id : {
        type : mongoose.Types.ObjectId,
        ref : 'Blog',
        required : true
    },
    user_Id : {
        type : mongoose.Types.ObjectId,
        ref : 'User',
        required : true
    }
},{timestamps : true})

// <-------------------- Model ----------------------->

const CommentModel = mongoose.model("Comment", CommentSchema);

module.exports = CommentModel;