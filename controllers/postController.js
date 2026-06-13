// controllers/postController.js
const Post = require('../models/Post');

// Create a new post
exports.createPost = async (req, res) => {
    try {
        const { content, authorId } = req.body;
        if (!content || !authorId) {
            return res.status(400).json({ error: 'Content and author are required' });
        }

        const newPost = new Post({ content, author: authorId });
        await newPost.save();
        
        // Populate author info before sending back
        await newPost.populate('author', 'username');
        
        res.status(201).json(newPost);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all posts for the feed (sorted by newest first)
exports.getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('author', 'username')
            .populate('comments.author', 'username')
            .sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Toggle like/unlike on a post
exports.toggleLike = async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId } = req.body;

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        const likeIndex = post.likes.indexOf(userId);

        if (likeIndex > -1) {
            // User already liked it, so unlike
            post.likes.splice(likeIndex, 1);
        } else {
            // User hasn't liked it, add like
            post.likes.push(userId);
        }

        await post.save();
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add a comment to a post
exports.addComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const { text, authorId } = req.body;

        if (!text || !authorId) {
            return res.status(400).json({ error: 'Comment text and author are required' });
        }

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        const newComment = { text, author: authorId };
        post.comments.push(newComment);
        
        await post.save();
        
        // Fetch fully populated post to send back up-to-date details to frontend
        const updatedPost = await Post.findById(postId)
            .populate('author', 'username')
            .populate('comments.author', 'username');

        res.status(201).json(updatedPost);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};