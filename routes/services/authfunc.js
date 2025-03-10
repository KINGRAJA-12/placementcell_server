
const User = require("../../models/user.module");

const registerUser = async (req, res) => {
  const { username, password, role } = req.body;

  try {
    // Check if user exists
    const userExists = await User.findOne({ username });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    // Create new user
    const user = new User({ username, password, role });
    await user.save();
    
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports =registerUser;
