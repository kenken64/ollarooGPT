import multer from 'multer';
import fs from 'fs';

export const uploadDirectory = 'uploads/';
var currentImageFile = "";

if (!fs.existsSync(uploadDirectory)) {
    console.log('The directory doesnt exists');
    fs.mkdirSync(uploadDirectory);
}

// Set up storage for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory);
    },
    filename: (req, file, cb) => {
        currentImageFile = Date.now() + '-' + file.originalname;
        cb(null, currentImageFile);    
    }
});

// Create the multer instance
const upload = multer({ storage: storage, limits: { fileSize: 25000000 } });
export default upload;
