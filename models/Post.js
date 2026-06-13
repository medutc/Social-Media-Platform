// models/Post.js
const mongoose = require('mongoose');

// We can embed comments directly into the post for a mini-app to keep queries fast
const commentSchema = new mongoose.Schema({
    text: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
});

const postSchema = new mongoose.Schema({
    content: { 
        type: String, 
        required: true 
    },
    author: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    // The like system stores the IDs of users who liked the post
    likes: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }],
    comments: [commentSchema]
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);