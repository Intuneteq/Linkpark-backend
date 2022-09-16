const userModel = require('../Model/user');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require('dotenv').config();

const handleLogin = async (req, res) => {
    const { email, password } = req.body;
    
    //checking is user inputed email and password
    if(!email || !password) res.status(400).json({message: 'email and password required'})

    //checking if user exists
    const user = await userModel.findOne({email: email}).exec();
    if(!user) res.sendStatus(401);

    //evaluating password
    const match = await bcrypt.compare(password, user.password);
    if(match) {

        //create accesstoken using jwt
        const accessToken = jwt.sign(
            {email: user.email},
            process.env.ACCESS_TOKEN_SECRET,
            {expiresIn: '300s'}
        )

        //create refresh token using jwt
        const refreshToken = jwt.sign(
            {email: user.email},
            process.env.REFRESH_TOKEN_SECRET,
            {expiresIn: '1d'}
        )

        //save refresh token for current user
        user.refreshToken = refreshToken;
        const result = await user.save();
        console.log(result);
        //res.cookie and send accesstoken with json
        res.cookie("jwt", refreshToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }); //add secure: true and samesite: 'none' for development
        res.json({success: `${user.firstName} ${user.lastName} signed in`, accessToken})
    } else {
        res.sendStatus(401);
    }
}

module.exports = {handleLogin};