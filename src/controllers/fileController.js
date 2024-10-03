// Handle File Upload
exports.handleFileUpload = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    // Send response with the file path
    res.status(200).json({ message: 'File uploaded successfully', filePath: req.file.path });
};
