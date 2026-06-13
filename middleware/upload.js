// middleware/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create upload directories if they don't exist
const ensureDir = (dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const createStorage = (folder) => multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, `../public/uploads/${folder}`);
        ensureDir(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, unique + path.extname(file.originalname).toLowerCase());
    }
});

const mediaFilter = (req, file, cb) => {
    if (/^(image|video|audio)\//.test(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image, video, and audio files are allowed.'));
    }
};

const imageOnlyFilter = (req, file, cb) => {
    if (/^image\//.test(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed for profile pictures.'));
    }
};

// For post media (images, videos, audios) — 100MB max
exports.postUpload = multer({
    storage: createStorage('posts'),
    fileFilter: mediaFilter,
    limits: { fileSize: 100 * 1024 * 1024 }
});

// For profile pictures (images only) — 5MB max
exports.profileUpload = multer({
    storage: createStorage('profiles'),
    fileFilter: imageOnlyFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});