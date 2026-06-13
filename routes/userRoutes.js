// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/register', userController.createUser);
router.get('/', userController.getAllUsers);
router.post('/follow', userController.toggleFollow);

module.exports = router;