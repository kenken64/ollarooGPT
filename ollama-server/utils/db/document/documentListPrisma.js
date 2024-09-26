import { prisma } from "../prisma.js";

export const listDocumentsFromDB = async () =>{
    try {
        const documents = await prisma.document.findMany();
        console.log('List of documents:', documents);
        return documents;
    } catch (error) {
        console.error('Error fetching documents:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}
