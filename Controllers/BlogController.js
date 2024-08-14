const BlogModel = require("../Models/BlogModel");
const UserModel = require("../Models/UserModel");


//      <------------------------------- CREATE BLOG ---------------------------->

exports.CreateBlogController = async(req,res) => {
    try{
        const {title, content} = req.body;
        const author_id = req.user._id;

        if(!title || !content){
            return res.status(400).send({
                success : false,
                message : "Please Fill all fields."
            })
        }

        const newBlog = new BlogModel({title, content, author_id});
        await newBlog.save();

        const user = await UserModel.findById(author_id);
        user.Blogs.push(newBlog);
        await user.save();

        return res.status(200).send({
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

        const Blog = await BlogModel.findById(req.params.id);

        if(!Blog){
            return res.status(400).send({
                success : false,
                message : "Blog not found!!",
            })
        }

        if (Blog.author_id.toString() !== req.user._id.toString()) {
            return res.status(403).send({
                success: false,
                message: "You are not authorized to update this blog"
            });
        }

        Blog.title = title || Blog.title;
        Blog.content = content || Blog.content;

        await Blog.save();

        return res.status(200).send({
            success : true,
            message : "Blog Update",
            Blog
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
        const Blog = await BlogModel.findById(req.params.id);

        if(!Blog){
            return res.status(400).send({
                success : false,
                message : "Blog not found!!",
            })
        }

        if (Blog.author_id.toString() !== req.user._id.toString()) {
            return res.status(403).send({
                success: false,
                message: "You are not authorized to update this blog"
            });
        }

        await BlogModel.findByIdAndDelete(req.params.id);

        const delUserBlog = await UserModel.findById(Blog.author_id);
        delUserBlog.Blogs.pull(Blog);
        await delUserBlog.save();

        return res.status(201).send({
            success : true,
            message : "Blog Deleted",
            Blog
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