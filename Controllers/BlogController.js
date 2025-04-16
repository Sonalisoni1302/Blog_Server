const BlogModel = require("../Models/BlogModel");
const UserModel = require("../Models/UserModel");
const mongoose = require("mongoose");
const multer = require('multer');
const cloudinary = require('../cloud/cloudinary'); 
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const {nanoid} = require("nanoid");
const NtfcnModel = require("../Models/NtfcnModel");
const commentModel = require("../Models/CommentModel");



//      <------------------------------- CREATE BLOG ---------------------------->


// Configure multer storage for Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'blog_banners', // Folder name in Cloudinary
      allowed_formats: ['jpg', 'png', 'jpeg'], // Allowed file types
    },
  });

  exports.upload = multer({ storage });


  exports.CreateBlogController = async(req,res) => {
    try{
        let {title, banner, des, content, tags, draft, id} = req.body;
        let author_id = req.user._id;
        
        if(!title || !content){
            return res.status(400).send({
                success : false,
                message : "Please Fill all fields."
            })
        }

        tags = Array.isArray(tags) ? tags : [tags];
        tags = tags.map(tag=>tag.toLowerCase());

        let blogId = id || title.replace(/[^a-zA-z0-9]/g, ' ').replace(/\s*/g, "-").trim() + nanoid();

        if(id){
            try{
                const updateBlog = await BlogModel.findOneAndUpdate(
                    { blog_Id: blogId }, 
                    { title, des, banner, content, tags, draft: draft ? draft : false }, 
                    { new: true } // To return the updated document
                );
    
                if (!updateBlog) {
                    return res.status(404).json({ error: "Blog not found" });
                } // Now it will log the updated blog
    
                return res.status(200).json({ id: blogId });
            
            } catch (err) {
                return res.status(500).json({ error: "Failed to update total posts number" });
            }

        }else{
            const newBlog = new BlogModel({blog_Id : blogId, title, banner, des, content, tags, author_id, draft : Boolean(draft)});
            await newBlog.save();

            await UserModel.findByIdAndUpdate(author_id, {$push : {"Blogs" : new mongoose.Types.ObjectId(newBlog._id) }, $inc : {"activity.total_posts" : 1}}, {new : true});

            return res.status(200).send({
                success : true,
                message : "Blog Created",
                newBlog
            })
        
        }
    }catch(err){
        console.log(err);
        return res.status(500).send({
            success : false,
            message : "Error While Creating Blog"
        })
    }
};


//      <-------------------------------- GET LATEST BLOGS ------------------------------>

exports.GetLetestBlogsController = async(req,res) =>{
    try{

        let {page} = req.body;

        let maxLimit = 5;

        let skipElement = (page - 1) * maxLimit;

        const blogs = await BlogModel.find({draft:false})
        .populate("author_id", "personal_Info.profile_img personal_Info.username personal_Info.fullname")
        .sort({"createdAt" : -1}).select("title des banner activity Comments tags createdAt blog_Id")
        .skip(skipElement)
        .limit(maxLimit);

        if(!blogs){
            return res.status(400).send({
                success : false,
                message : "Blogs not Found!!"
            })
        }

        return res.status(201).send({
            success : true,
            message : "All Blogs->",
            blogs
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



exports.GetallLatestBlogsCount  = async(req, res) => {
    BlogModel.countDocuments({draft:false}).then(count => {
        return res.status(200).json({totalDocs : count})
    }).catch(err => {
        console.log(err.message);
        return res.status(500).json({error : err.message})
    })
}



exports.GetTrendingBlogsController = async(req, res) => {
    BlogModel.find({draft:false})
    .populate("author_id", "personal_Info.profile_img personal_Info.username personal_Info.fullname")
    .sort({"activity.total_reads" : -1, "activity.total_likes": -1, "createdAt" : -1})
    .select("blog_Id title createdAt")
    .limit(5)
    .then(blogs=>{
        return res.status(200).json({blogs});
    }).catch(err=>{
        return res.status(500).json({error : err.message});
    })
}

//      <-------------------------------- GET USER BLOGS --------------------------------->

exports.GetUserBlogsController = async(req,res) => {
    try{

        let user_id = req.user;
        let {page, draft, query, deleteDocCount} = req.body;

        let maxLimit = 5;
        let skipDocs = (page-1)*maxLimit;

        if(deleteDocCount){
            skipDocs -= deleteDocCount;
        }

        const blogs = await BlogModel.find({author_id : user_id, draft, title : new RegExp(query, 'i')}).skip(skipDocs).limit(maxLimit).sort({publishedAt : -1}).select("title banner createdAt blog_Id activity des draft -_id")

        return res.status(200).json({blogs});

    }catch(err){
        return res.status(500).json({ error: err.message });
    }
}

exports.GetUserBlogsCountController = async(req,res) => {
    try{

        let user_id = req.user;

        let {draft, query} = req.body;

        const Count = await BlogModel.countDocuments({author_id : user_id, draft, title : new RegExp(query, 'i')})

        return res.status(200).json({totalDocs : Count});

    }catch(err){
        return res.status(500).json({error : err.message});
    }
}


exports.SearchBlogController = async(req,res) => {
    let{tag, query, author, page, limit, eliminate_blog} = req.body;

    let findQuery;

    if(tag){
        findQuery = {tags:{ $regex: new RegExp('^' + tag, 'i') }, draft:false, blog_Id : {$ne : eliminate_blog}};
    }else if(query){
        findQuery = {tags:{ $regex: new RegExp('^' + query, 'i') }, draft:false};
    }else if(author){
        findQuery = {author_id: new mongoose.Types.ObjectId(author), draft:false}
    }

    let maxLimit = limit ? limit : 2;

    BlogModel.find(findQuery).populate("author_id", "personal_Info.username personal_Info.fullname -_id")
    .sort({"createdAt" : -1}).select("title des banner activity tags createdAt blog_Id -_id").skip((page-1)*maxLimit)
    .limit(maxLimit).then(blogs => {
        return res.status(200).json({blogs})
    }).catch(err => {
        return res.status(500).json({error: err.message});
    })
}


exports.searchBlogCount = async(req,res)=>{
    let {author, tag, query} = req.body;
    let findQuery = {tags:{ $regex: new RegExp('^' + tag, 'i') } , draft:false};

    if(tag){
        findQuery = {tags:{ $regex: new RegExp('^' + tag, 'i') }, draft:false};
    }else if(query){
        findQuery = {tags:{ $regex: new RegExp('^' + query, 'i') }, draft:false};
    }else if(author){
        findQuery = {author_id: new mongoose.Types.ObjectId(author), draft:false}
    }

    BlogModel.countDocuments(findQuery).then(count=>{
        return res.status(200).send({
            success : true,
            totalDocs : count
        })
    }).catch(err=>{
        console.log(err.message);
        return res.status(500).send({
            success : false,
            err : err.message
        })
    })
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
        let user_id = req.user;
        let {blog_Id} = req.body;

        const blog = await BlogModel.findOneAndDelete({blog_Id});

        await NtfcnModel.deleteMany({blog : blog._id});
        console.log('Notification deleted');

        commentModel.deleteMany({blog_id : blog._id});
        console.log('Comments deleted');

        UserModel.findByIdAndUpdate({_id: user_id}, {$pull : {Blogs : blog._id}, $inc : {"account_Info.total_posts" : -1}});
        console.log('User blog deleted');

        return res.status(200).json({status: 'done'});

    }catch(err){
        return res.status(500).json({error : err.message});
    }
}

    //    <--------------------------------- GET BLOG ----------------------------------->

exports.GetBlogController = async(req, res)=> {
        let {blog_Id, draft, mode} = req.body;

        let inCrementVal = mode != 'edit' ? 1 : 0;
        
    try{
        let blog = await BlogModel.findOneAndUpdate(
            { blog_Id },
            { $inc: { "activity.total_reads": inCrementVal } },
            { new: true }  // This ensures the updated blog is returned
        )
        .populate("author_id", "personal_Info.fullname personal_Info.username personal_Info.profile_img").populate("Comments")
        .select("title des content banner blog_Id activity createdAt tags");

        // If blog not found
        if (!blog) { 
            return res.status(404).json({ error: "Blog not found" });
        }

        // Update the author's total_reads
        await UserModel.findOneAndUpdate(
            { "personal_Info.username": blog.author_id.personal_Info.username },
            { $inc: { "account_Info.total_reads": inCrementVal } }
        );

        if(blog.draft && !draft){
            return res.status(500).json({error : 'you can not access draft blogs'});
        }

        return res.status(200).json({ blog });

    } catch (err) {
        console.error("Error fetching blog:", err);
        return res.status(500).json({ error: err.message });
    }
}