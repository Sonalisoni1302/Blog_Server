const mongoose = require("mongoose");

//    <----------------- Schema ------------------->

const userSchema = new mongoose.Schema({
    personal_Info : {
        fullname : {
            type : String,
            lowercase : true,
            required : true
        },
        email : {
            type : String,
            lowercase : true,
            unique : true,
            required : true
        },
        password : String,
        username : {
            type : String,
            unique : true,
            required : true
        }
    },
    Blogs : [
        {
            type : mongoose.Types.ObjectId,
            ref : 'Blog'
        }
    ]
},{timestamps : true})

// <-------------------- Model ----------------------->
const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;