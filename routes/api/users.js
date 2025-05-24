const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const gravatar = require('gravatar');
const User = require('../../models/user');
const auth = require('../../middlewares/auth');
const fileController = require('../../middlewares/fileController');
const upload = require('../../middlewares/uploadAvatar');
const { validateRegistration, validateLogin, validateSubscription } = require('../../middlewares/validation');
require('dotenv').config();

const { SECRET_KEY = 'secret-key' } = process.env;

// Înregistrare - /users/signup
router.post('/signup', validateRegistration, async (req, res, next) => {
  try {
    const { email, password, subscription = 'starter' } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      return res.status(409).json({ message: 'Email in use' });
    }

    // Generează URL-ul avatarului folosind gravatar
    const avatarURL = gravatar.url(email, { s: '250', r: 'pg', d: 'identicon' });

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = await User.create({
      email,
      password: hashedPassword,
      subscription,
      avatarURL
    });

    res.status(201).json({
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
        avatarURL: newUser.avatarURL
      }
    });
  } catch (error) {
    next(error);
  }
});

// Login - /users/login
router.post('/login', validateLogin, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Email or password is wrong' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email or password is wrong' });
    }

    const payload = {
      id: user._id,
    };

    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
    await User.findByIdAndUpdate(user._id, { token });

    res.json({
      token,
      user: {
        email: user.email,
        subscription: user.subscription
      }
    });
  } catch (error) {
    next(error);
  }
});

// Logout - /users/logout
router.post('/logout', auth, async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { token: null });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Current - /users/current
router.get('/current', auth, async (req, res, next) => {
  try {
    const { email, subscription } = req.user;
    res.json({
      email,
      subscription
    });
  } catch (error) {
    next(error);
  }
});

// Actualizare subscription - /users
router.patch('/', auth, validateSubscription, async (req, res, next) => {
  try {
    const { subscription } = req.body;
    const { _id } = req.user;
    
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      { subscription },
      { new: true }
    );
    
    res.json({
      email: updatedUser.email,
      subscription: updatedUser.subscription
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /avatars - încărcare avatar
router.patch(
  '/avatars',
  auth,
  upload.single('avatar'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Avatar file is required' });
      }
     const response = await fileController.processAvatar(req, res);
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;