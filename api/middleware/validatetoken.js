const asynchandler=require("express-async-handler");
const jwt =require("jsonwebtoken");

const tokenvalidation=asynchandler(async (req, res, next) => {
    let token;
    const authheader=req.headers.authorization || req.headers.Authorization;

    if (authheader && authheader.startsWith("Bearer ")) {
        token = authheader.split(" ")[1];

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                res.status(401);
                throw new Error("User not authorized: Invalid token");
            }

            req.user=decoded.user;
            next(); 
        });
    } else {
        res.status(401);
        throw new Error("User not authorized: No token provided");
    }
});

module.exports = tokenvalidation;
