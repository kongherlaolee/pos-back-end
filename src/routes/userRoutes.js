const express = require('express');
const router = express.Router();
const { loginUser, registerUser } = require('../controllers/userController');

// User login route
router.post('/login', loginUser);

// User registration route
router.post('/register', registerUser);


module.exports = router;
