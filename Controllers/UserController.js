const UserModel = require("../Models/UserModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {nanoid} = require("nanoid");
const NtfcnModel = require("../Models/NtfcnModel");

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
        let {fullname, email, password} = req.body;

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

        // Hashing Password
        const hass_password = await bcrypt.hash(password, 10);
        newUser.personal_Info.password = hass_password;

        // Generate Token
        const Token = await jwt.sign({id : newUser._id, email : newUser.personal_Info.email}, process.env.SECRET_KEY, {expiresIn : "15d"});

        await newUser.save();

        
        return res.status(201).send({
            success : true,
            message : "Ragistered SuccessFully",
            Token : Token,
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
        
        // Matching Password
        const pswrdMatch = await bcrypt.compare(password, emailMatch.personal_Info.password);
        
        if(!pswrdMatch){
            return res.status(404).send({
                success : false,
                message : "Invalid Details!!"
            })
        }
        

        // Generate Token
        const token = await jwt.sign({id : emailMatch._id, email : emailMatch.personal_Info.email}, process.env.SECRET_KEY, {expiresIn : "15d"});

        return res.status(201).send({
            success : true,
            message : "Login Successfully",
            token,
            username : emailMatch.personal_Info.username,
            profile_img : emailMatch.personal_Info.profile_img
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




// <-------------------- Search User ------------------------->

exports.SearchUserController = async(req, res) => {
    let {query} = req.body;

    UserModel.find({"personal_Info.username" : new RegExp(query, 'i')})
    .limit(50)
    .select("personal_Info.fullname personal_Info.username personal_Info.profile_img -_id")
    .then(users => {
        return res.status(200).json({users})
    }).catch(err => {
        return res.status(500).json({error: err.message})
    })
};


// <-------------------------- Get Profile ------------------------>

exports.GetProfileController = async(req, res) =>{
    let {username} = req.body;

    UserModel.findOne({"personal_Info.username" : username})
    .select("-personal_Info.password -google_auth -updateAt -blogs")
    .then(user => {
        return res.status(200).json(user);
    }).catch(err => {
        console.log(err);
        return res.status(500).json({error : err.message});
    })
};


//      <-------------------------- Change Password ------------------------->
exports.ChangPasswordController = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!passwordRegex.test(currentPassword) || !passwordRegex.test(newPassword)) {
        return res.status(403).json({
            error: "Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters."
        });
    }

    try {
        const user = await UserModel.findOne({ _id: req.user });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (user.global_auth) {
            return res.status(403).json({
                error: "You can't change account's password because you logged in through Google"
            });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.personal_Info.password);

        if (!isMatch) {
            return res.status(403).json({ error: "Incorrect Current Password" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await UserModel.findOneAndUpdate(
            { _id: req.user },
            { "personal_Info.password": hashedPassword }
        );

        return res.status(200).json({ status: "password changed" });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: "Some error occurred while changing the password, please try again later"
        });
    }
};


// <-------------------------- Update Profile Image ------------------------->
exports.UpdateImgController = (req, res) => {
    let {url} = req.body;

    UserModel.findOneAndUpdate({ _id: req.user }, { "personal_Info.profile_img": url }, { new: true }).then(() => {
        return res.status(200).json({profile_img : url})
    }).catch(err => {
        return res.status(500).json({error : err.message})
    })
}


// <-------------------------- Update Profile ------------------------->
exports.UpdateProfileController = (req,res) => {
    let {username, bio, social_links} = req.body;

    let bioLimit = 150;

    if(username.length < 3){
        return res.status(403).json({error : "Username should be at least 3 letters long"});
    }

    if(bio.length > bioLimit){
        return res.status(403).json({error : `Bio should not be more than ${bioLimit} letters`});
    }

    let socialLinksArr = Object.keys(social_links);

    try{

        for(let i = 0; i<socialLinksArr.length; i++){
            if(social_links[socialLinksArr[i]].length){
                let hostname = new URL(social_links[socialLinksArr[i]]).hostname;

                if(!hostname.includes(`${socialLinksArr[i]}.com`) && socialLinksArr[i] != "website"){
                    return res.status(403).json({error : `Enter valid ${socialLinksArr[i]} link`});
                }
            }
        }

    }catch(err){
        return res.status(500).json({error : "You must provide full social Links with http(s) included"})
    }

    let updateObj = {
        "personal_Info.username" : username,
        "personal_Info.bio" : bio,
        social_links
    }

    UserModel.findOneAndUpdate({_id : req.user}, updateObj, {runValidators : true}).then(() => {
        return res.status(200).json({username});
    }).catch(err => {
        if(err.code == 11000){
            return res.status(409).json({error : "Username is already taken"})
        }
        return res.status(500).json({error : err.message});
    })
}


exports.NtfcnController = (req, res) => {

    let user_id = req.user;

    NtfcnModel.exists({ntfcn_for : user_id, seen : false, user: {$ne : user_id}}).then(result => {
        if(result){
            return res.status(200).json({new_notification_available : true})
        }else{
            return res.status(200).json({new_notifican_available : false})
        }
    }).catch(err => {
        console.log(err);
        return res.status(500).json({error : err.message})
    })
}

//       <-------------------------------- Get all Notifications --------------------------->

exports.AllntfcnController = (req, res) => {
    let user_id = req.user;

    let {page, filter, deleteDocCount} = req.body;

    let maxLimit = 10;

    let findQuery = {ntfcn_for : user_id, user : {$ne : user_id}};

    let skipDocs = (page - 1)*maxLimit;

    if(filter != 'all'){
        findQuery.type = filter;
    }

    if(deleteDocCount){
        skipDocs -= deleteDocCount;
    }

    NtfcnModel.find(findQuery).skip(skipDocs).limit(maxLimit).populate("blog", "title blog_id").populate("user", "personal_Info.fullname personal_Info.username personal_Info.profile_img").populate("comment", "comment").populate("replied_on_comment", "comment").populate("reply", "comment").sort({createdAt : -1}).select("createdAt type seen reply").then(notifications => {

        NtfcnModel.updateMany(findQuery, {seen: true}).skip(skipDocs).limit(maxLimit).then(() => console.log('notification seen'));

        return res.status(200).json({notifications});

        return res.status(200).json({notifications});
    }).catch(err => {
        console.log(err);
        return res.status(500).json({error: err.message});
    })
}


exports.NtfcnCountController = (req, res) => {
    let user_id = req.user;

    let {filter} = req.body;

    let findQuery = {ntfcn_for : user_id, user : {$ne : user_id}};

    if(filter != 'all'){
        findQuery.type = filter;
    }

    NtfcnModel.countDocuments(findQuery).then(count => {
        return res.status(200).json({totalDocs : count})
    }).catch(err => {
        return res.status(500).json({error : err.message})
    })
}