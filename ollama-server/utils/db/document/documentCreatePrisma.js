import { prisma } from "../prisma.js";

export const createDocumentToDB = async (docData) => {
    try {
        const document = await prisma.document.create({
            data: docData
        });
        console.log('Document created:', document);
        return document;
    } catch (error) {
        console.error('Error creating document:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
};

