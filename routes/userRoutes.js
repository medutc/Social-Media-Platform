// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const { profileUpload } = require('../middleware/upload');

// Public
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected
router.get('/', auth, userController.getAllUsers);
router.get('/:id', auth, userController.getUserProfile);
router.post('/follow', auth, userController.toggleFollow);
router.put('/profile/update', auth, userController.updateProfile);
router.put('/profile/picture', auth, profileUpload.single('profilePicture'), userController.uploadProfilePicture);

module.exports = router;