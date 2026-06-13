// routes/postRoutes.js
const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

router.post('/', postController.createPost);
router.get('/', postController.getAllPosts);
router.put('/:postId/like', postController.toggleLike);
router.post('/:postId/comment', postController.addComment);

module.exports = router;