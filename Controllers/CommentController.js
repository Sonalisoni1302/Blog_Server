const BlogModel = require("../Models/BlogModel");
const CommentModel = require("../Models/CommentModel");
const UserModel = require("../Models/UserModel");
const NtfcnModel = require("../Models/NtfcnModel");
const ObjectId = require("mongodb").ObjectId;



//         <------------------------------ POST COMMENT --------------------------->

exports.CreateCommentController = async(req,res) =>{
    try{

        let {_id, comment, blog_author, replying_to, notification_id} = req.body;
        let user_id = req.user._id;

        if(!comment.length){
            return res.status(403).json({error : 'write something to leave a comment'})
        }

        let commentObj = {
            blog_id : _id, blog_author, comment, commented_by:user_id,      
        }

        if(replying_to){
            commentObj.parent = replying_to;
            commentObj.isreply = true;
        }

        new CommentModel(commentObj).save().then(async commentFile => {
            let {comment, commentedAt, children} = commentFile;

            BlogModel.findOneAndUpdate({_id}, {$push : {"Comments" : commentFile._id}, $inc : {"activity.total_comment" : 1,  "activity.total_parent_comments" : replying_to ? 0 : 1}}, {new : true}).then(blog => {
                console.log("New comment created");
            })

            let ntfcnObj = new NtfcnModel({
                type : replying_to ? "reply" :  "comment",
                blog : _id,
                ntfcn_for : blog_author,
                user : user_id,
                comment : commentFile._id
            });

            if(replying_to){
                ntfcnObj.replied_on_comment = replying_to;

                await CommentModel.findOneAndUpdate({_id : replying_to}, {$push : {children : commentFile._id}}, {new : true}).then(replyingTocommentDoc => {ntfcnObj.notification_for = replyingTocommentDoc.commented_by});

                if(notification_id){
                    await NtfcnModel.findOneAndUpdate({_id : notification_id}, {reply : commentFile._id}).then(notification => console.log('notification updated'))
                }
            }

            ntfcnObj.save().then(ntfcn => {
                console.log("Notification Created")
            })

            return res.status(200).json({
                comment, commentedAt, _id : commentFile._id, user_id, children
            })
        })
    }catch(err){
        console.log(err);
        return res.status(500).send({
            success : false,
            message : "Error While Creating Blog"
        })
    }
}


//         <-------------------------- GET BLOG ALL COMMENTS ------------------------>

exports.GetAllCommentsController = async(req,res) =>{
    try{
        
        let {blog_id, skip} = req.body;

        let maxLimit = 5;

        await CommentModel.find({blog_id, isReply : false}).populate("commented_by", "personal_Info.username personal_Info.fullname personal_Info.profile_img").skip(skip).limit(maxLimit).sort({'commentedAt' : -1}).then(comment => {
            return res.status(200).json(comment);
        }).catch(err => {
            console.log(err.message);
            return res.status(500).json({error : err.message})
        })

        // console.log("Fetched Comments:", comments);

    }catch(err){
        console.log(err);
        return res.status(500).send({
            success : false,
            message : "Error While posting comments!!",
            err
        })
    }
}


//         <-------------------------- GET SINGLE COMMENT --------------------------->

exports.GetSingleCommentController = async(req,res)=>{
    try{
        const comment = await CommentModel.findById(req.params.id);

        if(!comment){
            return res.status(400).send({
                success : false,
                message : "Comment not Found!!"
            })
        }

        return res.status(201).send({
            success : true,
            message : "Comment",
            comment
        })

    }catch(err){
        console.log(err);
        return res.status(500).send({
            success : false,
            message : "Error While getting comment!!",
            err
        })
    }
};


//         <---------------------------- UPDATE COMMENT ------------------------------>

exports.UpdateCommentController = async(req,res) =>{
    try{
        const{content} = req.body;

        const comment = await CommentModel.findById(req.params.id)

        if(!comment){
            return res.status(400).send({
                success : false,
                message : "Comment not Found!!"
            })
        }

        if (comment.user_Id.toString() !== req.user._id.toString()) {
            return res.status(403).send({
                success: false,
                message: "You are not authorized to update this comment"
            });
        }

        const update_comment = await CommentModel.findByIdAndUpdate(req.params.id, {content}, {new:true});

        return res.status(201).send({
            success : true,
            message : "Comment Updated",
            update_comment
        })

    }catch(err){
        console.log(err);
        return res.status(500).send({
            success : false,
            message : "Error While Updating comment!!",
            err
        })
    }
}


//         <----------------------------- DELETE COMMENT ---------------------------->

const deleteComment  = (_id) => {
    CommentModel.findOneAndDelete({_id}).then(comment => {
        
        if(comment.parent){
            CommentModel.findOneAndDelete({_id : comment.parent}, {$pull : {children : _id}}).then(data => console.log("comment delete from parent"))
            .catch(err => console.log(err));
        }

        NtfcnModel.findOneAndDelete({comment : _id}).then(notification => console.log("comment notification deleted"))

        NtfcnModel.findOneAndUpdate({reply : _id}, {$unset: {reply : 1}}).then(notification => console.log("reply notification deleted"))

        BlogModel.findOneAndUpdate({_id : comment.blog_id}, {$pull : {Comments : _id}, $inc : {"activity.total_comment" : -1, "activity.total_parent_comments" : comment.parent ? 0 : -1}}).then(blog => {
            if(comment.children.length){
                comment.children.map(replies => {
                    deleteComment(replies);
                })
            }
        })
    }).catch(err => {
        console.log(err.message);
    })
}

exports.DeleteCommentController = async(req,res)=>{
    
    let user_id = req.user._id;

    let {_id} = req.body;

    CommentModel.findOne({_id}).then(comment => {

        if(user_id.toString() == comment.commented_by.toString() || user_id.toString() == comment.blog_author.toString()){

            deleteComment(_id);
            return res.status(200).json({status : 'done'});

        }else{
            return res.status(403).json({error : "You can not delete this comment"});
        }
    })
}


//      <----------------------------- GET REPLIES ----------------------------->

exports.GetReplyController = async(req, res) => {
    
    let {_id, skip} = req.body;
    let maxLimit = 5;

    CommentModel.findOne({_id}).populate({
        path : "children",
        options : {
            linit : maxLimit,
            skip : skip,
            sort : {'commentedAt' : -1}
        },
        populate:{
            path : "commented_by",
            select : "personal_Info.username personal_Info.fullname personal_Info.profile_img"
        },
        select : "-blog_id -updateAt"
    })
    .select("children").then(doc => {
        return res.status(200).json({replies : doc.children})
    })
    .catch(err => {
        return res.status(500).json({error : err.message});
    })
}