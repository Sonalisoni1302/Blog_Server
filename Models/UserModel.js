const mongoose = require("mongoose");

let profile_imgs_name_list = ["Garfield", "Tinkerbell", "Annie", "Loki", "Cleo", "Angel", "Bob", "Mia", "Coco", "Gracie", "Bear", "Bella", "Abby", "Harley", "Cali", "Leo", "Luna", "Jack", "Felix", "Kiki"];
let profile_imgs_collections_list = ["notionists-neutral", "adventurer-neutral", "fun-emoji"];


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
        },
        profile_img: {
            type: String,
            default: () => {
                return `https://api.dicebear.com/6.x/${profile_imgs_collections_list[Math.floor(Math.random() * profile_imgs_collections_list.length)]}/svg?seed=${profile_imgs_name_list[Math.floor(Math.random() * profile_imgs_name_list.length)]}`
            } 
        },
    },

    social_links : {
        youtube : {
            type: String,
            dafault : " "
        },
        Instagram : {
            type : String,
            default : ""
        },
        twitter : {
            type : String,
            default : ""
        },
        github : {
            type : String,
            default : ""
        },
        website : {
            type : String,
            default : ""
        }
    },
    account_Info : {
        total_posts : {
            type : Number,
            default : 0
        },
        total_reads : {
            type : Number,
            default : 0
        }
    },
    google_auth : {
        type : Boolean,
        default : false
    },
    Blogs : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'Blog'
        }
    ]
},{timestamps : {
    createdAt: 'joinedAt'
}})

// <-------------------- Model ----------------------->
const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;