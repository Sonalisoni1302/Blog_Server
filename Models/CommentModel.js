const mongoose = require("mongoose");

// <----------------- Schema ------------------->
 
const CommentSchema = new mongoose.Schema({
    blog_id : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : "Blog"
    },
    blog_author:{
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : "Blog"
    },
    comment : {
        type : String,
        required : true
    },
    children : {
        type : [mongoose.Schema.Types.ObjectId],
        ref : "Comment"
    },
    commented_by : {
        type : mongoose.Schema.Types.ObjectId,
        require : true,
        ref : "User"
    },
    isReply : {
        type : Boolean,
        default : false
    },
    parent : {
        type :mongoose.Schema.Types.ObjectId,
        ref : "Comment"
    }

},
{
    timestamps : {
        createdAt : 'commentedAt'
    }
})

// <-------------------- Model ----------------------->

const CommentModel = mongoose.model("Comment", CommentSchema);

module.exports = CommentModel;