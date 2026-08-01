import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import { errorResponse } from '../utils/errorHandler.js';

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const isString = (value) => typeof value === 'string';

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!isString(name) || !isString(email) || !isString(password)) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const exists = await User.findOne({ email: email.trim().toLowerCase() });
    if (exists) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const user = await User.create({ name, email, password });
    const token = signToken(user._id);

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    errorResponse(res, error, 'Could not create account');
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!isString(email) || !isString(password) || !email.trim() || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signToken(user._id);

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    errorResponse(res, error, 'Could not sign in');
  }
};

export const getMe = async (req, res) => {
  res.json({ user: req.user });
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!isString(currentPassword) || !currentPassword) {
      return res.status(400).json({ message: 'Current password is required' });
    }
    if (!isString(newPassword) || newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user || !(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    errorResponse(res, error, 'Could not change password');
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!isString(email) || !email.trim()) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return res.status(200).json({
        message: 'If an account exists for that email, a reset link has been issued.',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');

    user.resetPasswordToken = hashToken(resetToken);
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    res.json({
      message: 'Password reset link created. It expires in 1 hour.',
      resetToken,
      resetUrl: `/reset-password/${resetToken}`,
    });
  } catch (error) {
    errorResponse(res, error, 'Could not create reset link');
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!isString(token) || !token.trim()) {
      return res.status(400).json({ message: 'Reset token is required' });
    }
    if (!isString(password) || password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const user = await User.findOne({
      resetPasswordToken: hashToken(token.trim()),
      resetPasswordExpires: { $gt: new Date() },
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password updated. You can now sign in.' });
  } catch (error) {
    errorResponse(res, error, 'Could not reset password');
  }
};

export const getNewUsersCount = async (req, res) => {
  try {
    const since = req.query.since;
    const filter = { role: 'user' };
    if (since && !Number.isNaN(Date.parse(since))) {
      filter.createdAt = { $gt: new Date(since) };
    }
    const count = await User.countDocuments(filter);
    res.json({ count });
  } catch (error) {
    errorResponse(res, error);
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().sort('-createdAt');

    const counts = await Booking.aggregate([
      { $group: { _id: '$user', count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(counts.map((c) => [String(c._id), c.count]));

    const enriched = users.map((u) => ({
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
      bookings: countMap[String(u._id)] || 0,
    }));

    res.json({ count: users.length, users: enriched });
  } catch (error) {
    errorResponse(res, error);
  }
};

export const deleteUser = async (req, res) => {
  try {
    if (String(req.params.id) === String(req.user._id)) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await Booking.deleteMany({ user: user._id });

    res.json({ message: 'User deleted' });
  } catch (error) {
    errorResponse(res, error);
  }
};
