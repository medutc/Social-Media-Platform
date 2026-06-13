// routes/postRoutes.js
const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const auth = require('../middleware/auth');
const { postUpload } = require('../middleware/upload');

router.post('/', auth, postUpload.single('media'), postController.createPost);
router.get('/', auth, postController.getAllPosts);
router.delete('/:postId', auth, postController.deletePost);
router.put('/:postId/like', auth, postController.toggleLike);
router.post('/:postId/comment', auth, postController.addComment);

module.exports = router;