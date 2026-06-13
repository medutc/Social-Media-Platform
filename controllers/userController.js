// controllers/userController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// Register
exports.register = async (req, res) => {
    try {
        const { username, password, bio } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already taken' });
        }

        const newUser = new User({ username, password, bio });
        await newUser.save();

        const token = generateToken(newUser);
        const userObj = newUser.toObject();
        delete userObj.password;

        res.status(201).json({ token, user: userObj });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid password' });

        const token = generateToken(user);
        const userObj = user.toObject();
        delete userObj.password;

        res.status(200).json({ token, user: userObj });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get single user profile + their posts
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate('followers', 'username profilePicture')
            .populate('following', 'username profilePicture');

        if (!user) return res.status(404).json({ error: 'User not found' });

        const Post = require('../models/Post');
        const posts = await Post.find({ author: req.params.id })
            .populate('author', 'username profilePicture')
            .populate('comments.author', 'username profilePicture')
            .sort({ createdAt: -1 });

        res.status(200).json({ user, posts });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update bio
exports.updateProfile = async (req, res) => {
    try {
        const { bio } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { bio },
            { new: true }
        ).select('-password');
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Upload / update profile picture
exports.uploadProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        // Delete old profile picture from disk if it exists
        const currentUser = await User.findById(req.user.id);
        if (currentUser.profilePicture) {
            const oldPath = path.join(__dirname, '../public', currentUser.profilePicture);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }

        const profilePicture = `/uploads/profiles/${req.file.filename}`;
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { profilePicture },
            { new: true }
        ).select('-password');

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Toggle follow/unfollow
exports.toggleFollow = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const { targetUserId } = req.body;

        if (currentUserId === targetUserId) {
            return res.status(400).json({ error: 'You cannot follow yourself' });
        }

        const targetUser = await User.findById(targetUserId);
        const currentUser = await User.findById(currentUserId);

        if (!targetUser || !currentUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        const isFollowing = currentUser.following.some(id => id.toString() === targetUserId);

        if (isFollowing) {
            currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId);
            targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUserId);
        } else {
            currentUser.following.push(targetUserId);
            targetUser.followers.push(currentUserId);
        }

        await currentUser.save();
        await targetUser.save();

        const updatedUser = await User.findById(currentUserId).select('-password');
        res.status(200).json({
            message: isFollowing ? 'Unfollowed' : 'Followed',
            currentUser: updatedUser
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};