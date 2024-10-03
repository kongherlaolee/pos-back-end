const express = require('express');
const router = express.Router();
const multer = require('multer');
const { handleFileUpload } = require('../controllers/fileController');

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

// File upload route
router.post('/upload', upload.single('file'), handleFileUpload);

module.exports = router;
