const userModel = require("../Model/user");
const jwt = require("jsonwebtoken");

const handleRefreshToken = async (req, res) => {
  //get cookie from req
  const cookies = req.cookies;

  //check for jwt in cookie
  if (!cookies?.jwt) return res.sendStatus(401);

  //if jwt accesstoken is found get it out from the cookie, store it in memory as a refresh token variable and clear the cookie
  const refreshToken = cookies.jwt;

  //clear cookie cause we will send a new refresh token to the cookie
  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });

  //compare refresh token taken out of the cookie with that in the database
  const foundUser = await userModel.findOne({ refreshToken }).exec();

  //Now we have a refresh token from the cookie but it's not in the db(most likely overwritten already). This is a case of refresh token reuse
  if (!foundUser) {
    jwt.verify(   //now we try to match the already concluded expired rt gotten from the cookie to a user and delete all existing user rt in db
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        if (err) return res.sendStatus(403);  //at this point, we cannot decode the refresh token. 
        const hackedUser = await userModel  //at this point, rt is not yet expired but we cleared it out of the db. Definitely a malicious reuse!
          .findOne({ email: decoded.email })
          .exec();  //now, we have the user the hacker is trying to impersonate
        hackedUser.refreshToken = [];
        await hackedUser.save(); // force re-login
      }
    );
    return res.sendStatus(403);
  }

  //At this point, the token from the cookie is a valid token in the db and we are ready to re-issue a new one on refresh
  const newRefreshTokenArray = foundUser.refreshToken.filter(
    (rt) => rt !== refreshToken  //filtering out the old refresh token, leaving the new one 
  );

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      // if token is expired
      if (err) {
        console.log("expired refresh token");
        foundUser.refreshToken = [...newRefreshTokenArray];
        await foundUser.save();
      }
      //making sure email from the user with refreshtoken matches the email with refreshtoken of DB
      if (err || foundUser.email !== decoded.email) return res.sendStatus(403); //forbidden

      //Refresh token was still valid
      const roles = Object.values(foundUser.roles);

      //if all is right, sign user in and issue another accesstoken using jwt
      const accessToken = jwt.sign(
        {
          userInfo: {
            email: decoded.email,
            roles: roles,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "300s" }
      );

      const newRefreshToken = jwt.sign(
        { email: foundUser.email },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "1d" }
      );

      const userInfo = {
        firstName: foundUser.firstName,
        lastName: foundUser.lastName,
        id: foundUser._id,
      };

      //save refresh token for current user
      foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
      await foundUser.save();

      //send back the newly generated refresh token
      res.cookie("jwt", newRefreshToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        secure: true,
        samesite: "none",
      }); //add secure: true and samesite: 'none' for development

      res.json({ accessToken, userInfo });
    }
  );
};

module.exports = { handleRefreshToken };
