const mongoose = require("mongoose");

//    <----------------- Schema ------------------->

const BlogSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true
    },
    content : {
        type : String,
        required : true
    },
    author_id : {
        type : mongoose.Types.ObjectId,
        ref : 'User',
        required : true
    },
    Comments : [
        {
            type : mongoose.Types.ObjectId,
            ref : 'Comment'
        }
    ]
},{timestamps : true})

// <-------------------- Model ----------------------->

const BlogModel = mongoose.model('Blog', BlogSchema);

module.exports = BlogModel;