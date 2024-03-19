const jwt = require('jsonwebtoken');
require('dotenv').config();

// Mongo Atlas connection
const { MongoClient } = require('mongodb');
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
const db = client.db('carInfo');

let collection;


// // Middleware for user Login
// userAuth = async (req, res, next) => {
//     const data = { username: req.body.username, password: req.body.password }

//     collection = db.collection("users");
//     const user = await collection.findOne({ username: data.username, password: data.password });
//     const message = { error: "Incorrect Username or Password" };

//     if (!user) {
//         return res.status(403).json(message);
//     } else {
//         req.user = user;
//         next();
//     }
// }

// Middleware for Login
// loginUser = async (req, res, next) => {
//     const data = req.body;
//     const type = req.body.type;

//     collection = db.collection(type);
//     const user = await collection.findOne({ username: data.username, password: data.password });
//     const message = { error: "Incorrect Username or Password" };

//     if (!user) {
//         return res.status(403).json(message);
//     } else {
//         req.user = user;
//         next();
//     }
// }


// Middleware to verify CookieJWT
verifyCookieToken = (req, res, next) => {
    try {
        const token = req.cookies.token;
        const secretKey = process.env.ACCESS_TOKEN_SECRET;

        const user = jwt.verify(token, secretKey);      // Verifying the JWT accessToken
        req.data = user;
        console.log("token verified")
        next();
    } catch (err) {
        res.clearCookie("token");
        return res.status(403).json({ error: 'Authorization Failed! Login Again' });
    }
}

module.exports = { verifyCookieToken };