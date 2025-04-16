const mongoose = require("mongoose");

//    <----------------- Schema ------------------->

const BlogSchema = new mongoose.Schema({
    blog_Id : {
        type : String,
        required : true,
        unique : true
    },
    title : {
        type : String,
        required : true
    },
    banner : {
        type : String
    },
    des : {
        type : String,
        maxlength : 350
    },
    content : {
        type : Object,
        required : true
    },
    tags : {
        type : [String]
    },
    draft : {
        type : Boolean,
        required : true
    },
    author_id : {
        type : mongoose.Types.ObjectId,
        ref : 'User',
        required : true
    },
    activity : {
        total_likes : {
            type : Number,
            default : 0
        },
        total_comment : {
            type : Number,
            default : 0
        },
        total_reads : {
            type : Number,
            default : 0
        },
        total_parent_comments: {
            type: Number,
            default: 0
        }
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