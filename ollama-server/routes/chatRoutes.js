import { Router } from 'express';

import { uploadFile, chatOllama, 
        chatWithPDF, uploadGenAIPDF, 
        generateAISong,
        getAllDocuments,
        saveDocument } from '../controller/chatController.js';
import flupload from '../middleware/upload-image.js';
import pdfUpload from '../middleware/upload-pdf.js';
import { authenticateCorbado } from '../security/verifyPasskey.js'

const router = Router();

router.get('/chat',  authenticateCorbado, chatOllama);
router.get('/chat-pdf',  authenticateCorbado, chatWithPDF);
router.post('/pdf-upload',  authenticateCorbado, pdfUpload.single('pdf-file'), uploadGenAIPDF);
router.post('/upload', authenticateCorbado, flupload.single('file'), uploadFile);

router.get('/generate-song',  authenticateCorbado, generateAISong);
router.get('/list-document',  authenticateCorbado, getAllDocuments);
router.post('/create-document',  authenticateCorbado, saveDocument);

export default router;