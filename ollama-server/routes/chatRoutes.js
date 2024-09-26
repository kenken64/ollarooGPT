import { Router } from 'express';

import { uploadFile, chatOllama, 
        chatWithPDF, uploadGenAIPDF, 
        generateAISong,
        getAllDocuments,
        saveDocument } from '../controller/chatController.js';
import flupload from '../middleware/upload-image.js';
import pdfUpload from '../middleware/upload-pdf.js';

const router = Router();

router.get('/chat',  chatOllama);
router.get('/chat-pdf',  chatWithPDF);
router.post('/pdf-upload',  pdfUpload.single('pdf-file'), uploadGenAIPDF);
router.post('/upload', flupload.single('file'), uploadFile);

router.get('/generate-song',  generateAISong);
router.get('/list-document',  getAllDocuments);
router.post('/create-document',  saveDocument);

export default router;