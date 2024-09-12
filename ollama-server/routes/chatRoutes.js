import { Router } from 'express';

import { uploadFile, chatOllama, chatWithPDF, uploadGenAIPDF, generateAISong } from '../controller/chatController.js';
import flupload from '../middleware/upload-image.js';
import pdfUpload from '../middleware/upload-pdf.js';

const router = Router();

router.post('/upload', flupload.single('file'), uploadFile);
router.get('/chat',  chatOllama);
router.get('/chat-pdf',  chatWithPDF);
router.post('/pdf-upload',  pdfUpload.single('pdf-file'), uploadGenAIPDF);
router.get('/generate-song',  generateAISong);

export default router;