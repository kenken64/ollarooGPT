import multer from 'multer';
import fs from 'fs';

const uploadPDFDirectory = 'pdf/';
var currentPDFFile = "";

if(!fs.existsSync(uploadPDFDirectory)) {
    console.log("This pdf directory doesnt exists !");
    fs.mkdirSync(uploadPDFDirectory);
  }
  
const storagePDF = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPDFDirectory);
    },
    filename: (req, file, cb) => {
        currentPDFFile = Date.now() + '-' + file.originalname;
        cb(null, currentPDFFile);
        
    }
});
  
const uploadPDF = multer({ storage: storagePDF });

export default uploadPDF;