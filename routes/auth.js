
const express = require("express"); 
const auth = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");


const User = require("../schema/user");

const SECRET_KEY = "Hello, I am Rishi";
const generateToken = (user) =>{
    return jwt.sign({
        id:user._id,
        email:user.email
    }, SECRET_KEY, {
        expiresIn:"1h",
    })
}

const chceckMiddleware = async (req,res,next) =>{
    console.log(req.body)
    const user =await  User.findOne({email:req.body.email});
    
    req.user = user;
    next();
}

async function registerUser(req,res,next){
    try {
        const {email,password,role,username} = req.body;

        if(req.user) return res.status(400).json({ msg:"User Already exists"});

        const newUser = new User({email, role, password, username});

        await newUser.save();

        res.status(201).json({msg:"User created Successfully", user:newUser});
    } catch (error) {
        console.log(error.message)
        res.status(500).json({err:"Server side error"});
    }

}

async function loginuser(req,res,next){
    const {email, password} = req.body;
    try {
        if(!req.user) return res.status(400).json({msg:"User not Register"});

        const isMatch = await bcrypt.compare(password,req.user.password);

        if(!isMatch) return res.status(400).json({msg:"Invalid credentials"});

        const token =await generateToken(req.user);

        res.cookie("authToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // ✅ Works in production (HTTPS)
            sameSite: "None", // ✅ Required for cross-origin cookies
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        })

        res.status(200).json({
            token,
            user:req.user,
            msg:"Login sucessfully"
        });
    } catch (error) {
        res.status(500).json({err:"Server side error"});
    }
}

async function getUser(req, res, next) {
    const token = req.cookies.authToken; // ✅ Corrected from `req.cookie` to `req.cookies`

    if (!token) return res.status(401).json({ msg: "Unauthorized: No token" });

    try {
        const user = jwt.verify(token, SECRET_KEY);
        const getuser = await User.findById(user.id)
        res.status(200).json({user:getuser});
    } catch (err) {
        res.status(403).json({ msg: "Invalid token" });
    }
}




auth.use(chceckMiddleware);

auth.get("/",getUser);

auth.post("/register",registerUser);

auth.post("/login",loginuser);


module.exports = auth;