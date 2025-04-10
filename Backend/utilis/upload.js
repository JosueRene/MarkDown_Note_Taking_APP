const multer = require('multer')
const path = require('path')
const fs = require('fs')

// Ensure the 'uploads' directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage for uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir) // Set upload directory to the absolute path
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
        cb(null, `${uniqueSuffix}-${file.originalname}`)
    }
})

// Filter to allow only Markdown files
const fileFilter = (req, file, cb) => {
    const fileExtension = path.extname(file.originalname).toLowerCase();

    if(file.mimetype === "text/markdown" || fileExtension === ".md") {
        cb(null, true)
    } else {
        cb(new Error('Only Markdown files are allowed!'), false)
    }
}

// Export multer upload instance
const upload = multer({
    storage, 
    fileFilter,
})

module.exports = upload