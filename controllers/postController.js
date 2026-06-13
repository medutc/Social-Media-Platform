// controllers/postController.js
const Post = require('../models/Post');
const path = require('path');

// Detect media type from mimetype
function getMediaType(mimetype) {
    if (/^image\//.test(mimetype)) return 'image';
    if (/^video\//.test(mimetype)) return 'video';
    if (/^audio\//.test(mimetype)) return 'audio';
    return null;
}

// Create a new post (with optional media)
exports.createPost = async (req, res) => {
    try {
        const authorId = req.user.id;
        const content = req.body.content?.trim() || '';
        const file = req.file;

        // Must have either content or a media file
        if (!content && !file) {
            return res.status(400).json({ error: 'Post must have a caption or a media file.' });
        }

        const postData = { content, author: authorId };

        if (file) {
            postData.media = {
                url: `/uploads/posts/${file.filename}`,
                type: getMediaType(file.mimetype),
                originalName: file.originalname
            };
        }

        const newPost = new Post(postData);
        await newPost.save();
        await newPost.populate('author', 'username profilePicture');

        res.status(201).json(newPost);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all posts (feed)
exports.getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('author', 'username profilePicture')
            .populate('comments.author', 'username profilePicture')
            .sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a post (author only)
exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        if (post.author.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to delete this post' });
        }

        // Delete media file from disk if it exists
        if (post.media?.url) {
            const fs = require('fs');
            const filePath = path.join(__dirname, '../public', post.media.url);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        await Post.findByIdAndDelete(req.params.postId);
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Toggle like/unlike
exports.toggleLike = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.id;

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        const isLiked = post.likes.some(id => id.toString() === userId);

        if (isLiked) {
            post.likes = post.likes.filter(id => id.toString() !== userId);
        } else {
            post.likes.push(userId);
        }

        await post.save();
        res.status(200).json({ likesCount: post.likes.length, isLiked: !isLiked });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add a comment
exports.addComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const { text } = req.body;
        const authorId = req.user.id;

        if (!text) {
            return res.status(400).json({ error: 'Comment text is required' });
        }

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        post.comments.push({ text, author: authorId });
        await post.save();

        const updatedPost = await Post.findById(postId)
            .populate('author', 'username profilePicture')
            .populate('comments.author', 'username profilePicture');

        res.status(201).json(updatedPost);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};