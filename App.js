const express = require("express");
const app = express();
require("dotenv").config({path : "./config.env"});
const mongoose = require("mongoose");


// Routers
const user = require("./Routers/UserRouters");
const Blog = require("./Routers/BlogRouter");
const Comment = require("./Routers/CommentRouters");

// Use
app.use(express.json());
// app.use(express.urlencoded({extended : true}));
app.use("/user", user);
app.use("/blog", Blog);
app.use("/comment", Comment);


// CONNECT TO DB
mongoose.connect(process.env.DB).then((result)=>{
    console.log("Connect Successfully");
}).catch((err)=>{
    console.log(err);
})



PORT = process.env.PORT;
app.listen(PORT, (req,res)=>{
    console.log("Server is running at PORT " + PORT);
})