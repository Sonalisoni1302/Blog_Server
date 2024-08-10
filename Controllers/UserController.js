const UserModel = require("../Models/UserModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {nanoid} = require("nanoid");

//         <-------------------------- SIGN UP -------------------------------->

// regex for email
let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; 

// regex for password
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

const generateUserna = async(email) =>{
    let username = email.split("@")[0];

    let IsuserExist = await UserModel.exists({"personal_Info.username" : username});

    IsuserExist ? username += nanoid().substring(0,5) : "";
    console.log(username);
    return username;
}


exports.signup = async(req,res)=>{
    try{
        let {fullname, email, password, username} = req.body;

        if(!fullname || !email || !password){
            return res.status(404).send({
                success : false,
                message : "Please Complete All fields"
            })
        }

        if(!emailRegex.test(email)){
            return res.status(404).send({
                success : false,
                message : "Enter a valid email"
            })
        }

        if(!passwordRegex){
            return res.status(404).send({
                success : false,
                message : "Password at least between 6 to 20 characters."
            })
        }

        let user = await UserModel.findOne({"personal_Info.email" : email});

        if(user){
            return res.status(400).send({
                success : false,
                message : "Already Ragistered!!"
            })
        }

        username = await generateUserna(email);
        const newUser = new UserModel({personal_Info : {fullname, email, password, username}});

        const hass_password = await bcrypt.hash(password, 10);
        newUser.personal_Info.password = hass_password;

        await newUser.save();

        return res.status(201).send({
            success : true,
            message : "Ragistered SuccessFully",
            newUser
        })


    }catch(err){
        console.log(err);
        return res.status(500).send({
            success : false,
            message : "Error While SignUp",
            err
        })
    }
};



//         <-------------------------------------- SIGN IN -------------------------------->

exports.signin = async(req,res) => {
    try{
        const {email, password} = req.body;
        
        if(!email || !password){
            return res.status(400).send({
                success : false,
                message : "please fill all fields"
            })
        }

        let emailMatch = await UserModel.findOne({"personal_Info.email" : email});
        if(!emailMatch){
            return res.status(404).send({
                success : false,
                message : "Invalid Details!!"
            })
        }
        
        const pswrdMatch = await bcrypt.compare(password, emailMatch.personal_Info.password);
        
        if(!pswrdMatch){
            return res.status(404).send({
                success : false,
                message : "Invalid Details!!"
            })
        }
        
        const token = await jwt.sign({id : emailMatch._id, email : emailMatch.personal_Info.email}, process.env.SECRET_KEY, {expiresIn : "15d"});
        console.log(token);

        return res.status(201).send({
            success : true,
            message : "Login Successfully",
            token : token
        })

    }catch(err){
        console.log(err);
        return res.status(500).send({
            success : false,
            message : "Error While SignIn",
            err
        })
    }
};




//         <-------------------------------------- Get User Data --------------------------->

exports.AuthUser = async(req, res) =>{
    try{
            const userData = req.user;
            console.log(userData);
            res.status(200).send({
                success : true,
                message : userData
            })

    }catch(err){
        console.log(err);
        res.status(500).send({
            success : false,
            message : "Error",
            err
        })
    }
};