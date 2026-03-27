const jwt = require("jsonwebtoken");

const generateToken = (user_id, user_role, res) => {
  const token = jwt.sign({ user_id, user_role }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  res.cookie("jwt", token, {
    maxAge: 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "strict",
  });

  return token;
};

module.exports = generateToken;
