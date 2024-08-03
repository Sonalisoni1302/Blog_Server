const BlogModel = require("../Models/BlogModel");
const UserModel = require("../Models/UserModel");


//      <------------------------------- CREATE BLOG ---------------------------->

exports.CreateBlogController = async(req,res) => {
    try{
        const {title, content, author_id} = req.body;

        if(!title || !content || !author_id){
            return res.status(400).send({
                success : false,
                message : "Please Fill all fields."
            })
        }

        const existAuthor = await UserModel.findById(author_id);

        if(!existAuthor){
            return res.status(400).send({
                success : false,
                message : "Signup or Signin!!"
            })
        }

        const newBlog = new BlogModel({title, content, author_id});
        await newBlog.save();

        existAuthor.Blogs.push(newBlog);
        await existAuthor.save();

        return res.status(201).send({
            success : true,
            message : "Blog Created",
            newBlog
        })
        
    }catch(err){
        console.log(err);
        return res.status(500).send({
            success : false,
            message : "Error While Creating Blog"
        })
    }
};


//      <-------------------------------- GET ALL BLOGS ------------------------------>

exports.GetAllBlogsController = async(req,res) =>{
    try{
        const all_blogs = await BlogModel.find({ });

        if(!all_blogs){
            return res.status(400).send({
                success : false,
                message : "Blogs not Found!!"
            })
        }

        return res.status(201).send({
            success : true,
            message : "All Blogs->",
            all_blogs
        })

    }catch(error){
        console.log(error);
        return res.status(500).send({
            success : false,
            message : "Error While Getting Blogs",
            error
        })
    }
}

//      <-------------------------------- GET USER BLOGS --------------------------------->

exports.GetUserBlogsController = async(req,res) => {
    try{

        const user_blogs = await UserModel.findById(req.params.id).populate('Blogs');
        
        if(!user_blogs){
            return res.status(400).send({
                success : false,
                message : "Blogs not found!!"
            })
        }
        
        return res.status(201).send({
            success : true,
            message : "User Blogs->",
            user_blogs
        })

    }catch(error){
        console.log(error);
        return res.status(500).send({
            success : false,
            message : "Error While Getting User Blogs",
            error
        })
    }
}


//      <--------------------------------- UPDATE BLOG --------------------------------->

exports.UpdateBlogController = async(req,res)=>{
    try{
        const {title, content} = req.body;

        const update_blog = await BlogModel.findByIdAndUpdate(req.params.id, {title, content}, {new : true});

        if(!update_blog){
            return res.status(400).send({
                success : false,
                message : "Blog not found!!",
            })
        }

        return res.status(201).send({
            success : true,
            message : "Blog Update",
            update_blog
        })

    }catch(error){
        console.log(error);
        return res.status(500).send({
            success : false,
            message : "Error While Update Blog",
            error
        })
    }
}


//      <-------------------------------- DELETE BLOG -------------------------------->

exports.DeleteBlogController = async(req,res) => {
    try{
        const del_blog = await BlogModel.findByIdAndDelete(req.params.id);

        if(!del_blog){
            return res.status(400).send({
                success : false,
                message : "Blog not found!!"
            })
        }

        const delUserBlog = await UserModel.findById(del_blog.author_id);
        delUserBlog.Blogs.pull(del_blog);
        await delUserBlog.save();

        return res.status(201).send({
            success : true,
            message : "Blog Deleted",
            del_blog
        })

    }catch(error){
        console.log(error);
        return res.status(500).send({
            success : false,
            message : "Error While Deleting Blog",
            error
        })
    }
}