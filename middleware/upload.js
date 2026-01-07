const multer = require('multer');
const path = require('path');

// 1. Storage Configuration
// This tells Multer WHERE to save files and WHAT to name them.
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // 'cb' means callback. First arg is error (null), second is path.
        // Make sure a folder named 'uploads' exists in your root directory!
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // We create a unique name: fieldname-timestamp.extension
        // e.g., profilePic-123456789.jpg
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// 2. File Filter (Optional but recommended)
// Only accept images (jpeg, jpg, png)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true); // Accept file
    } else {
        cb(new Error('Only images are allowed!'), false); // Reject file
    }
};

// 3. Initialize Multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 5 } // Limit: 5MB
});

module.exports = upload;