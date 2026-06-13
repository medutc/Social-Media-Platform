// models/Post.js
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    text: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
});

const postSchema = new mongoose.Schema({
    // Caption — optional now (user might post media with no text)
    content: { 
        type: String, 
        default: ''
    },
    author: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    // Media attachment (image, video, or audio)
    media: {
        url: { type: String, default: null },
        type: { 
            type: String, 
            enum: ['image', 'video', 'audio', null], 
            default: null 
        },
        originalName: { type: String, default: null }
    },
    likes: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }],
    comments: [commentSchema]
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);