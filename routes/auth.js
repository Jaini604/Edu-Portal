const express = require('express');
const router = express.Router();
const User = require('../models/User');
const AdmissionForm = require('../models/AdmissionForm');
const jwt = require('jsonwebtoken');

// Secret key for JWT (use an environment variable in production)
const JWT_SECRET = 'your-secret-key';

// GET Home Page
router.get('/home', (req, res) => {
  res.render('home');
});

// GET Sign Up Page
router.get('/signup', (req, res) => {
  res.render('signup', { error: null });
});

// POST Sign Up
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const emailLowercase = email.toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: emailLowercase });
    if (existingUser) {
      return res.render('signup', { error: 'Email already exists!' });
    }

    // Create a new user
    const newUser = new User({
      name,
      email: emailLowercase,
      password, // Hash passwords in production
    });

    await newUser.save();

    res.redirect('/auth/signin');
  } catch (error) {
    console.error('Error during sign-up:', error);
    res.render('signup', { error: 'An error occurred during sign-up!' });
  }
});

// GET Sign In Page
router.get('/signin', (req, res) => {
  res.render('signin', { error: null });
});

// POST Sign In
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return res.render('signin', { error: 'Invalid credentials!' });
    }

    req.session.user = { id: user._id, name: user.name, email: user.email };

    const admissionData = await AdmissionForm.findOne({ userId: user._id });
    if (admissionData) {
      return res.redirect('/auth/submission-data');
    }

    res.redirect('/auth/admission-form');
  } catch (error) {
    console.error(error);
    res.render('signin', { error: 'An error occurred during sign-in!' });
  }
});

// GET Forgot Password Page
router.get('/forgot-password', (req, res) => {
  res.render('forgot-password', { error: null, success: null });
});

// POST Forgot Password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.render('forgot-password', { error: 'Email not found!', success: null });
    }

    // Generate a reset token
    const resetToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

    // Save the reset token in the database
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour from now
    await user.save();

    // Redirect to the reset-password route
    res.redirect(`/auth/reset-password/${resetToken}`);
  } catch (error) {
    console.error('Error during forgot password:', error);
    res.render('forgot-password', { error: 'An error occurred during the reset process!', success: null });
  }
});

// GET Reset Password Page
router.get('/reset-password/:token', async (req, res) => {
  const { token } = req.params;

  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Find the user with the valid token
    const user = await User.findOne({
      _id: decoded.userId,
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.render('reset-password', { error: 'Invalid or expired token!', token: null });
    }

    res.render('reset-password', { error: null, token });
  } catch (error) {
    console.error('Error validating reset token:', error);
    res.render('reset-password', { error: 'An error occurred while validating the reset token!', token: null });
  }
});

// POST Reset Password
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Find the user by token
    const user = await User.findOne({
      _id: decoded.userId,
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.render('reset-password', { error: 'Invalid or expired token!', token: null });
    }

    // Update password (hashing should be added in production)
    user.password = password;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.redirect('/auth/signin');
  } catch (error) {
    console.error('Error resetting password:', error);
    res.render('reset-password', { error: 'An error occurred while resetting the password!', token });
  }
});

// GET Admission Form Page
router.get('/admission-form', (req, res) => {
  const user = req.session.user;

  if (!user) {
    return res.redirect('/auth/signin');
  }

  res.render('admission-form', { user });
});

// POST Admission Form
router.post('/admission-form', async (req, res) => {
  const { course, address, phone } = req.body;
  const user = req.session.user;

  if (!user) {
    return res.redirect('/auth/signin');
  }

  try {
    const newAdmission = new AdmissionForm({
      userId: user.id,
      name: user.name,
      email: user.email,
      course,
      address,
      phone,
    });

    await newAdmission.save();

    res.redirect('/auth/submission-data');
  } catch (error) {
    console.error('Error submitting admission form:', error);
    res.render('admission-form', { error: 'An error occurred while submitting the form!' });
  }
});

// GET Submission Data Page
router.get('/submission-data', async (req, res) => {
  const user = req.session.user;

  if (!user) {
    return res.redirect('/auth/signin');
  }

  try {
    const admissionData = await AdmissionForm.findOne({ userId: user.id });

    if (!admissionData) {
      return res.render('submission-data', { message: 'No submission found!' });
    }

    res.render('submission-data', { admissionData });
  } catch (error) {
    console.error('Error fetching submission data:', error);
    res.render('submission-data', { error: 'An error occurred while fetching your submission!' });
  }
});

// GET Sign Out
router.get('/signout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.redirect('/auth/home');
    }
    res.redirect('/auth/home');
  });
});

module.exports = router;
