const jwt = require("jsonwebtoken");
const User = require("../Models/UserModel");


    //  <------------------------------- Authentication Middleware --------------------------------->

exports.AuthMiddleware = async(req,res, next) => {
    try{

        const token = req.header("Authorization");
    
        if(!token){
            res.status(404).send({
                success: false,
                message : "Unauthorized HTTP, Token not provided"
            })
        }

        const jwtToken = token.replace("Bearer ", "").trim();

        const verifyToken = jwt.verify(jwtToken, process.env.SECRET_KEY);

        if(!verifyToken){
            res.status(404).send({
                success : false,
                message : "Token is not valid",
            })
        }

        const userData = await User.findOne({"personal_Info.email" : verifyToken.email}).select({"personal_Info.password" : 0 });

        req.user = userData; 

        next();

    }catch(err){
        console.log(err);
        res.status(500).send({
            success : false,
            message : "Error while taking Token",
            err
        })
    }
}
