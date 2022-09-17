const userModel = require("../Model/user");
const bcrypt = require("bcrypt");

const handleNewUser = async (req, res) => {
  const {
    email,
    firstName,
    lastName,
    password,
    phoneNumber,
    parentPhoneNumber,
    parentEmail,
    studentClass,
  } = req.body;

  if (
    !email ||
    !firstName ||
    !lastName ||
    !password ||
    !phoneNumber ||
    !parentPhoneNumber ||
    !parentEmail ||
    !studentClass
  ) {
    return res
      .status(400)
      .json({ message: "Kindly fill all required fields." });
  }

  const duplicate = await userModel.findOne({ email }).exec();

  if (duplicate) res.sendStatus(409).json({ message: "user already exist" });

  try {
    const hashedPwd = await bcrypt.hash(password, 10);

    await userModel.create({
      email: email,
      firstName: firstName,
      lastName: lastName,
      password: hashedPwd,
      phoneNumber: phoneNumber,
      parentPhoneNumber: parentPhoneNumber,
      parentEmail: parentEmail,
      studentClass: studentClass,
    });

    res
      .status(201)
      .json({ success: `New user ${firstName} ${lastName} created!` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { handleNewUser };
