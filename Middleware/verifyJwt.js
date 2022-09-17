const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyJwt = async (req, res, next) => {
    //Get request header auth
    const authHeader = req.headers.authorization || req.headers.Authorization;

    //confirm if the auth comes with access token bearer
    if(!authHeader?.startsWith('Bearer ')) return res.sendStatus(401);

    //get token from header and split
    const token = authHeader.split(' ')[1];

    //verify token
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if(err) return res.sendStatus(403); //invalid token
            req.email = decoded.email;
            req.roles = decoded.UserInfo.roles;
            next();
        }
    )
}

module.exports = verifyJwt;