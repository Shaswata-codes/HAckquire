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
    avatar: user.avatar,
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
      avatar: user.avatar,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

// @desc    Google OAuth Login / Sign-up
// @route   POST /api/auth/google
const googleAuth = async (req, res) => {
  try {
    const { credential, profile } = req.body;

    let email, name, googleId, picture;

    // 1. If Google ID Token credential is provided, verify with Google
    if (credential) {
      const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
      if (!googleRes.ok) {
        return res.status(401).json({ message: 'Invalid Google authentication token' });
      }
      const data = await googleRes.json();
      email = data.email;
      name = data.name || data.given_name || 'Google User';
      googleId = data.sub;
      picture = data.picture || '';
    } else if (profile && profile.email) {
      // Direct verified profile payload (fallback/dev mode)
      email = profile.email;
      name = profile.name || 'Google User';
      googleId = profile.id || profile.sub || `google_${Date.now()}`;
      picture = profile.picture || profile.avatar || '';
    } else {
      return res.status(400).json({ message: 'Missing Google authentication credentials' });
    }

    if (!email) {
      return res.status(400).json({ message: 'Could not obtain email from Google account' });
    }

    // 2. Find or create user
    let user = await User.findOne({ $or: [{ googleId }, { email: email.toLowerCase() }] });

    if (user) {
      // Update googleId and avatar if missing
      if (!user.googleId) user.googleId = googleId;
      if (picture && !user.avatar) user.avatar = picture;
      await user.save();
    } else {
      // Create new user via Google
      user = await User.create({
        name,
        email: email.toLowerCase(),
        googleId,
        avatar: picture,
        businessName: name,
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      businessName: user.businessName,
      avatar: user.avatar,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Google Auth Error:', error.message);
    res.status(500).json({ message: 'Google authentication failed', error: error.message });
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
    avatar: req.user.avatar,
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
    avatar: updatedUser.avatar,
    phone: updatedUser.phone,
    address: updatedUser.address,
    gstNumber: updatedUser.gstNumber,
    currency: updatedUser.currency,
    token: generateToken(updatedUser._id),
  });
};

module.exports = { register, login, googleAuth, getProfile, updateProfile };
