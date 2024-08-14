const BlogModel = require("../Models/BlogModel");
const CommentModel = require("../Models/CommentModel");
const UserModel = require("../Models/UserModel");



//         <------------------------------ POST COMMENT --------------------------->

exports.CreateCommentController = async(req,res) =>{
    try{

        const {content, post_Id} = req.body;
        const user_Id = req.user._id;

        if(!content || !post_Id){
            return res.status(400).send({
                success : false,
                message : "Please Fill All fields"
            })
        }

        const existBlog = await BlogModel.findById(post_Id);

        if(!existBlog){
            return res.status(400).send({
                success : false,
                message : "post_Id not Exist"
            })
        }

        const newComment = new CommentModel({content, post_Id, user_Id});
        await newComment.save();

        existBlog.Comments.push(newComment);
        await existBlog.save();

        return res.status(200).send({
            success : true,
            message : "Comment SUccessfull",
            newComment
        })

    }catch(err){
        console.log(err);
        return res.status(500).send({
            success : true,
            message : "Error While posting comment!!",
            err
        })
    }
}


//         <-------------------------- GET BLOG ALL COMMENTS ------------------------>

exports.GetAllCommentsController = async(req,res) =>{
    try{
        const Blog_Comments = await BlogModel.findById(req.params.id).populate('Comments');

        if(!Blog_Comments){
            return res.status(400).send({
                success : false,
                message : "Comments not Found!!"
            })
        }

        return res.status(200).send({
            success : true,
            message : "Comments->",
            Blog_Comments
        })

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

exports.DeleteCommentController = async(req,res)=>{
    try{

        const comment = await CommentModel.findById(req.params.id);

        if(!comment){
            return res.status(404).send({
                sucess : false,
                message : "comment not found!!"
            })
        }

        if (comment.user_Id.toString() !== req.user._id.toString()) {
            return res.status(403).send({
                success: false,
                message: "You are not authorized to delete this comment"
            });
        }

        const del_comment = await CommentModel.findByIdAndDelete(req.params.id);

        const delUserComment = await BlogModel.findById(del_comment.post_Id);
        delUserComment.Comments.pull(del_comment);
        await delUserComment.save();

        return res.status(201).send({
            success : true,
            message : "Comment Deleted",
            del_comment
        })

    }catch(err){
        console.log(err);
        return res.status(500).send({
            success : false,
            message : "Error While Deleting comment!!",
            err
        })
    }
}