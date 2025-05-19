const User = require('../models/User');

const jwt = require('jsonwebtoken');

//generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

//register user
const registerUser = async (req, res) => { 
    const { fullName, email, password,profileImageUrl } = req.body;

    if (!fullName || !email || !password) {
        return res.status(400).json({ message: 'Please fill all fields' });
    }

    try {
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            fullName,
            email,
            password,
            profileImageUrl,
        });

            res.status(201).json({
                id: user._id,
                user,
                token: generateToken(user._id),
            });
    } catch (err) {
        res.status(500)
        .json({ message: 'Error in registering user', error: err.message });
    }
};

//login user
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    if(!email || !password) {
        return res.status(400).json({ message: 'Please fill all fields' });
    }try {
        const user = await User.findOne({ email });
        if(!user|| !(await user.comparePassword(password))) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        res.status(200).json({
            id: user._id,
            user,
            token: generateToken(user._id),
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Error in logging in user', error: err.message });
    }
 };

//get user info
const getUserInfo = async (req, res) => {
    try{
        const user = await User.findById(req.user._id).select("-password");
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    }catch (err) {
        res.status(500).json({ message: 'Error in fetching user info', error: err.message });
    }
 };
// ...existing code...
module.exports = {
    registerUser,
    loginUser,
    getUserInfo
};
