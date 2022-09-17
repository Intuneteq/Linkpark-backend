const userModel = require('../Model/user');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const handleLogOut = async (req, res) => {
    //Also delete cookie in frontend

    //Get cookie from req
    const cookies = req.cookies;
    if(!cookies?.jwt) return res.sendStatus(204);  //No content so good to go

    //if access token found set it as refresh token
    const refreshToken = cookies.jwt;

    //check if refreshtoken is in database
    const foundUser = await userModel.findOne({ refreshToken }).exec();
    
    //if user is not found return a 204, delete cookie and logout user
    if(!foundUser) {
        res.clearCookie('jwt', { httpOnly: true });  //use sameSite: 'None', secure: true for deployment
        return res.sendStatus(204);
    }

    //if user is found we need to delete refreshToken from dataabase 
    foundUser.refreshToken = '';
    await foundUser.save();

    res.clearCookie('jwt', { httpOnly: true });  //use sameSite: 'None', secure: true for deployment
    return res.sendStatus(204);
}

module.exports ={handleLogOut};