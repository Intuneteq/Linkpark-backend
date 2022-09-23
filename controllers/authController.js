const userModel = require("../Model/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const handleLogin = async (req, res) => {
  //Get the jwt cookies from the request
  const cookies = req.cookies;
  console.log("cookies", cookies);

  //Get email and password from req
  const { email, password } = req.body;

  //checking is user inputed email and password
  if (!email || !password)
    return res.status(400).json({ message: "email and password required" });

  //checking if user exists
  const user = await userModel.findOne({ email }).exec();
  if (!user) return res.status(404).json({ message: "email not found" });

  //evaluating password
  const match = await bcrypt.compare(password, user.password);

  if (match) {
    const roles = Object.values(user.roles).filter(Boolean);

    //create accesstoken using jwt
    const accessToken = jwt.sign(
      {
        userInfo: {
          email: user.email,
          roles: roles,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "300s" }
    );

    //create refresh token using jwt
    const newRefreshToken = jwt.sign(
      { email: user.email },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    //on refresh token create, it's added to the rt array in database. first we have to make sure the cookie is empty(if the user signed out on last sign in)
    let newRefreshTokenArray = !cookies?.jwt
      ? user.refreshToken  //if there is no cookie in jwt, then let db remain as it is
      : user.refreshToken.filter((rt) => rt !== cookies.jwt); //making sure refresh token in cookie is removed from the db

    //if we have an old cookie, remove
    if (cookies?.jwt) {
      const refreshToken = cookies.jwt;
      const foundToken = await userModel.findOne({ refreshToken }).exec();

      //Detected refresh Token reuse!
      if (!foundToken) {
        console.log("atempted refresh token reuse at login !");
        //clear out all previous resfresh tokens
        newRefreshTokenArray = [];
      }
      
      res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "None",
        secure: true,
      });
    }

    //save refresh token for current user
    user.refreshToken = [...newRefreshTokenArray, newRefreshToken];
    const result = await user.save();

    console.log(result);

    //data to send to client
    const userInfo = {
      firstName: user.firstName,
      lastName: user.lastName,
      id: user._id,
      roles,
    };

    //res.cookie and send accesstoken with json
    res.cookie("jwt", newRefreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      secure: true,
      samesite: "none",
    }); //add secure: true and samesite: 'none' for development
    res.json({
      success: `${user.firstName} ${user.lastName} signed in`,
      accessToken,
      userInfo,
    });
  } else if (!match) {
    return res.status(401).json({ message: "unauthorized user" });
  } else return res.status(404);
};

module.exports = { handleLogin };
