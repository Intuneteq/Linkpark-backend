const userModel = require('../Model/user');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const handleRefreshToken = async ( req, res ) => {
    //get cookie from req
    const cookies = req.cookies

    //check for jwt in cookie
    if (!cookies?.jwt) return res.status(401);

    //if jwt accesstoken is found get it out from the cookie and store it as a refresh token
    const refreshToken = cookies.jwt;

    //compare refresh token in cookies with that in the database
    const foundUser = await userModel.findOne({ refreshToken }).exec();
    if (!foundUser) return res.sendStatus(403); //Forbidden 

    //if refreshToken doesn't match
    if(!foundUser) return res.sendStatus(403); //forbidden

    //if refreshToken match, evaluate jwt and issue another access token
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
            //making sure email from the user with refreshtoken matches the email with refreshtoken of DB
            if (err || foundUser.email !== decoded.email) return res.sendStatus(403); //forbidden
            const roles = Object.values(foundUser.roles);
            
            //if all is right, sign user in and issue another accesstoken using jwt
            const accessToken = jwt.sign(
                {
                    "userInfo": {
                        email: decoded.email,
                        roles: roles
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                {expiresIn: '300s'}
            )
                return res.json({accessToken})
        }
    )
}

module.exports = { handleRefreshToken }