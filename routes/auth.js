
const express = require("express"); 
const auth = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");


const User = require("../schema/user");

// const SECRET_KEY = "Hello, I am Rishi";
const ACCESS_TOKEN_SECRET = "Hello, I am Access Token";
const REFRESH_TOKEN_SECRET = "Hello, I am Refresh Token";

const generateAccessToken = (user) => {
    return jwt.sign({
        id: user._id,
        email: user.email
    }, ACCESS_TOKEN_SECRET, { expiresIn: "1h" });
};

const generateRefreshToken = (user) => {
    return jwt.sign({
        id: user._id,
        email: user.email
    }, REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
};

// const generateToken = (user) =>{
//     return jwt.sign({
//         id:user._id,
//         email:user.email
//     }, SECRET_KEY, {
//         expiresIn:"1h",
//     })
// }

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
        console.log("inside login",email,password)
        if(!req.user) return res.status(400).json({msg:"User not Register"});

        const isMatch = await bcrypt.compare(password,req.user.password);

        if(!isMatch) return res.status(400).json({msg:"Invalid credentials"});

        const accessToken = generateAccessToken(req.user);
        const refreshToken = generateRefreshToken(req.user);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "None",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.status(200).json({
            accessToken,
            user: req.user,
            msg: "Login successfully"
        });
    } catch (error) {
        res.status(500).json({err:"Server side error"});
    }
}

async function refreshToken(req, res) {
    const token = req?.cookies?.refreshToken;
    console.log(token)
    if (!token) return res.status(401).json({ msg: "Unauthorized: No refresh token" });

    try {
        const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET);
        const newAccessToken = generateAccessToken(decoded);
        res.status(200).json({ accessToken: newAccessToken });
    } catch (err) {
        res.status(403).json({ msg: "Invalid refresh token" });
    }
}

async function getUser(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ msg: "Unauthorized: No token" });

    try {
        const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
        const user = await User.findById(decoded.id);
        res.status(200).json({ user });
    } catch (err) {
        res.status(403).json({ msg: "Invalid token" });
    }
}


auth.get("/logout", (req, res) => {
    try {
        console.log("i call")
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: false,
            sameSite: "None"
        });
        console.log('done')
        res.status(200).json({ msg: "Logout successful" });
    } catch (error) {
        console.log(error.message)
    }
});

auth.use(chceckMiddleware);

auth.get("/",getUser);

auth.post("/register",registerUser);

auth.post("/login",loginuser);

auth.post("/refresh-token", refreshToken);


// test

const authenticateToken = (req, res, next) => {
    try{
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Extract token from "Bearer <token>"

    if (!token) return res.status(401).json({ msg: "Unauthorized: No token provided" });

    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ msg: "Forbidden: Invalid token" });

        req.user = decoded; // Store decoded user data in req.user
        console.log(req.user)
        next(); // Proceed to the next middleware or route handler
    });}
    catch(err){
        return res.status(500).json({message:err?.message});
    }
};

auth.get("/protected-route", authenticateToken, async (req, res) => {
    try {
        const user = await User.findOne({email:req.user.email});
        res.status(200).json({ user });
    } catch (err) {
        res.status(500).json({ msg: "Server error" });
    }
});


module.exports = auth;