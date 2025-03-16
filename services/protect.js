const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const ACCESS_TOKEN_SECRET = "Hello, I am Access Token";
const REFRESH_TOKEN_SECRET = "Hello, I am Refresh Token";

const authenticateToken = (req, res, next) => {

    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Extract token from "Bearer <token>"

    if (!token) return res.status(401).json({ msg: "Unauthorized: No token provided" });

    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ msg: "Forbidden: Invalid token" });

        req.user = decoded; // Store decoded user data in req.user
        console.log(req.user)
        next(); // Proceed to the next middleware or route handler
    });
};

module.exports = authenticateToken;