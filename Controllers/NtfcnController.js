const BlogModel = require("../Models/BlogModel");
const ntfcnModel = require("../Models/NtfcnModel");

exports.LikeController = (req, res) => {
    let user_id = req.user;

    let {_id, isLikedBlog} = req.body;

    let inCrementVal = !isLikedBlog ? 1 : -1;

     BlogModel.findOneAndUpdate({_id}, {$inc : {"activity.total_likes" : inCrementVal}}, {new : true}).then(blog => {
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        if(!isLikedBlog){
            let like = new ntfcnModel({
                type : "Like",
                blog : _id,
                ntfcn_for : blog.author_id,
                user : user_id
            })

            like.save().then(notification => {
                return res.status(200).json({liked_by_user : true})
            })
        }else{
            ntfcnModel.findOneAndDelete({type : "Like", blog : _id, user : user_id}).then(data =>{
                return res.status(200).json({liked_by_user : false});
            }).catch(err => {
                return res.status(500).json({error : err.message});
            })
        }
     })
}

exports.isLikeController = (req, res) => {
    let user_id = req.user;
    let {_id} = req.body;

    ntfcnModel.exists({type : "Like", blog : _id, user : user_id}).then(result=>{
        return res.status(200).json({result});
    }).catch(err => {
        return res.status(500).json({error : err.message})
    })
}