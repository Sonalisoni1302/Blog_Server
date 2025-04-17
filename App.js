const express = require("express");
const app = express();
const cors = require("cors");
const path = require('path');
require("dotenv").config({path : "./.env"});
const mongoose = require("mongoose");

app.use(cors({
    origin: [
      "http://localhost:3000",
      "https://fanciful-dragon-b4367e.netlify.app"
    ],
    credentials: true
}));

// Routers
const user = require("./Routers/UserRouters");
const Blog = require("./Routers/BlogRouter");
const Comment = require("./Routers/CommentRouters");
const ntfcn = require("./Routers/NtfcnRouter");

// Middleware
const Middleware = require("./Middleware/AuthMiddleware");


// Use
app.use(express.json({ limit: '50mb' })); // Increase JSON payload limit
app.use(express.urlencoded({ limit: '50mb', extended: true })); 


//  Routes 
app.use("/user", user);
app.use("/blog", Blog);
app.use("/comment", Comment);
app.use("/ntfcn", ntfcn);


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