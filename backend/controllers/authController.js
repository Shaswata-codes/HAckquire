const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register new user
// @route   POST /api/auth/register
const register = async (req, res) => {
  const { name, email, password, businessName } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please fill all required fields' });
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists with this email' });
  }

  const user = await User.create({ name, email, password, businessName: businessName || name });

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    businessName: user.businessName,
    token: generateToken(user._id),
  });
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      businessName: user.businessName,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
const getProfile = async (req, res) => {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    businessName: req.user.businessName,
    phone: req.user.phone,
    address: req.user.address,
    gstNumber: req.user.gstNumber,
    currency: req.user.currency,
  });
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
const updateProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const { name, businessName, phone, address, gstNumber, currency, password } = req.body;

  user.name = name || user.name;
  user.businessName = businessName || user.businessName;
  user.phone = phone || user.phone;
  user.address = address || user.address;
  user.gstNumber = gstNumber || user.gstNumber;
  user.currency = currency || user.currency;

  if (password) {
    user.password = password;
  }

  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    businessName: updatedUser.businessName,
    phone: updatedUser.phone,
    address: updatedUser.address,
    gstNumber: updatedUser.gstNumber,
    currency: updatedUser.currency,
    token: generateToken(updatedUser._id),
  });
};

module.exports = { register, login, getProfile, updateProfile };
