// controllers/userController.js
const User = require('../models/User');

// Create a new user profile
exports.createUser = async (req, res) => {
    try {
        const { username, bio } = req.body;
        if (!username) {
            return res.status(400).json({ error: 'Username is required' });
        }
        
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const newUser = new User({ username, bio });
        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all users (to discover people to follow)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-createdAt -updatedAt');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Toggle follow/unfollow a user
exports.toggleFollow = async (req, res) => {
    try {
        const { currentUserId, targetUserId } = req.body;

        if (currentUserId === targetUserId) {
            return res.status(400).json({ error: "You cannot follow yourself" });
        }

        const targetUser = await User.findById(targetUserId);
        const currentUser = await User.findById(currentUserId);

        if (!targetUser || !currentUser) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check if already following
        const isFollowing = currentUser.following.includes(targetUserId);

        if (isFollowing) {
            // Unfollow
            currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId);
            targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUserId);
        } else {
            // Follow
            currentUser.following.push(targetUserId);
            targetUser.followers.push(currentUserId);
        }

        await currentUser.save();
        await targetUser.save();

        res.status(200).json({ 
            message: isFollowing ? "Unfollowed successfully" : "Followed successfully",
            currentUser 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};