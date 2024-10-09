const express = require('express');
const router = express.Router();
const multer = require('multer');
const { handleFileUpload } = require('../controllers/fileController');
const path = require('path');

// Set up storage for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads')); // Ensure this path exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Unique filename
  },
});

const upload = multer({ storage });

// Endpoint for file upload
app.post('/api/products', upload.single('product_image'), (req, res) => {
  try {
    // Rest of the logic here
    res.status(200).send({ message: 'Product added successfully!' });
  } catch (error) {
    res.status(500).send({ error: 'Error adding product' });
  }
});


// File upload route
router.post('/api/upload', upload.single('file'), handleFileUpload);

module.exports = router;
