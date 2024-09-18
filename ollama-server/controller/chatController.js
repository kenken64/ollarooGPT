import ollama from 'ollama'
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OllamaEmbeddings } from "@langchain/ollama";
import { loadQAStuffChain } from "langchain/chains";
import { Document } from "langchain/document";
import { Ollama } from "@langchain/ollama";
import fetch from 'node-fetch';
import { Pinecone } from '@pinecone-database/pinecone';
import fs from 'fs';

function toBase64(filePath) {
    console.log(filePath)
    const img = fs.readFileSync(filePath);
    return Buffer.from(img).toString('base64');
}

console.log(process.env.PINECONE_API_KEY);
const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY
});


try{
  await pc.createIndex({
    name: process.env.PINECONE_INDEX_NAME,
    dimension: 5120, // Replace with your model dimensions
    metric: 'euclidean', // Replace with your model metric
    spec: { 
        serverless: { 
            cloud: 'aws', 
            region: 'us-east-1' 
        }
    } 
  });
}catch(e){
  console.log('Error creating index!');
  console.log("Assigned existing index")
  var index = pc.Index(process.env.PINECONE_INDEX_NAME)
}


// Set up a route for file uploads
export const uploadFile = async (req, res) => {
    try{
        console.log(req.file);
        // Handle the uploaded file
        let imageInBase64 = toBase64(req.file.path);
        const response = await ollama.chat({
            model: process.env.VISUAL_MODEL,
            messages: [{ role: 'user', 
            content: 'Please describe this image?', 
            images: [imageInBase64] }],
        })
        
        console.log(response.message.content);
        res.status(200).json(response.message.content);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to process the image' });
    }
};

export const chatOllama =  async (req, res) => {
    try{
        console.log('message: ' + req.query.message)
        console.log(process.env.OLLAMA_BASE_URL)
        let msg = req.query.message
        if(msg.length > 4096){
          res.status(500).json({ error: 'Prompt message exceed 4096' });
        }
        const response = await ollama.chat({
            model: process.env.OLLAMA_MODEL, // Default value
            baseUrl: process.env.OLLAMA_BASE_URL, // Default value
            messages: [{ role: 'user', content: msg }],
            return_type: 'markdown'
        })
        console.log(response.message.content)
        res.status(200).json(response.message.content)
    }catch(error){
        console.error(error);
        res.status(500).json({ error: 'Failed to process the chat request' });
    }
};


export const chatWithPDF =  async (req, res) => {
    let responseResult = '';
    console.log('message: ' + req.query.message)
    let question = req.query.message;
    if(question.length > 4096){
      res.status(500).json({ error: 'Prompt message exceed 4096' });
    }
    const queryEmbedding = await new OllamaEmbeddings(
      {
        model: process.env.OLLAMA_MODEL, // Default value
        baseUrl: process.env.OLLAMA_BASE_URL, // Default value
      }
    ).embedQuery(question);
    console.log(queryEmbedding);
    let queryResponse = await index.query({
        topK: 10,
        vector: queryEmbedding,
        includeMetadata: true,
        includeValues: true,
    });
    console.log(`Found ${queryResponse.matches.length} matches...`);
    console.log(`Asking question: ${question}...`);
    if (queryResponse.matches.length) {
      const llm = new Ollama({
        model: process.env.OLLAMA_MODEL, // Default value
        baseUrl: process.env.OLLAMA_BASE_URL, // Default value
          return_type: 'markdown'
      });
      const chain = loadQAStuffChain(llm);
      console.log(queryResponse);
      const concatenatedPageContent = queryResponse.matches
        .map((match) => match.metadata.pageContent)
        .join(" ");
  
      console.log(concatenatedPageContent);
      const result = await chain.invoke({
        input_documents: [new Document({ pageContent: concatenatedPageContent })],
        question: question,
      });
      console.log(`Answer: ${result.text}`);
      responseResult = result.text;
    } else {
      console.log("Since there are no matches, Ollama will not be queried.");
    }
    res.status(200).json(`${responseResult}`);
}

export const uploadGenAIPDF =  async (req, res) => {
    // Handle the uploaded file
    console.log("uploading pdf ...");
    console.log(req.file);
    const loader = new PDFLoader(req.file.path);
    const docs = await loader.load();
    for (const doc of docs) {
      console.log(`Processing document: ${doc.metadata.source}`);
      const txtPath = doc.metadata.source;
      const text = doc.pageContent;
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 30000,
      });
      console.log("Splitting text into chunks...");
      const chunks = await textSplitter.createDocuments([text]);
      console.log(`Text split into ${chunks.length} chunks`);
      console.log(
        `Calling Ollama's Embedding endpoint documents with ${chunks.length} text chunks ...`
      );
      console.log(index);
      const embeddings = new OllamaEmbeddings({
        model: process.env.OLLAMA_MODEL, // Default value
        baseUrl: process.env.OLLAMA_BASE_URL, // Default value
      });
      const embeddingsArrays = await embeddings.embedDocuments(
        chunks.map((chunk) => chunk.pageContent.replace(/\n/g, " "))
      );
      console.log("Finished embedding documents");
      console.log(
        `Creating ${chunks.length} vectors array with id, values, and metadata...`
      );
      
      let batches = [];
      if(chunks.length >0){
        for (let idx = 0; idx < chunks.length; idx++) {
            const chunk = chunks[idx];
            console.log(chunk.pageContent);
            const vector = {
              id: `${txtPath}_${idx}${Date.now()}`,
              values: embeddingsArrays[idx],
              metadata: {
                ...chunk.metadata,
                loc: JSON.stringify(chunk.metadata.loc),
                pageContent: chunk.pageContent /*.replace(/\n/g, " ")*/,
                txtPath: txtPath,
              },
            };
            console.log("pushing...")
            console.log(vector)
            const x =normalizeVector(vector, 5120)
            console.log(x)
            batches.push(x);
            console.log("VLVL>>>>>" + embeddingsArrays.length);
            // When batch is full or it's the last item, upsert the vectors
            console.log(batches.length)
            console.log(chunk.length)
          }
          console.log("...upsert !");
          try{
            await index?.upsert(batches);
          }catch(error){
            console.log("error !!!!")
            console.log(error)
          }
          // Empty the batch
          batches = [];
      }
    }
   
    res.status(200).json("I have reviewed the PDF you uploaded and am now familiar with its contents. Feel free to ask me anything related to the document.");
};

function normalizeVector(vector, targetDimension) {
  const vectorLength = vector.length;

  if (vectorLength > targetDimension) {
    // Truncate if too long
    return vector.slice(0, targetDimension);
  } else if (vectorLength < targetDimension) {
    // Pad with zeros if too short
    const padding = Array(targetDimension - vectorLength).fill(0);
    return vector.concat(padding);
  } else {
    // If already the correct dimension, return as is
    return vector;
  }
}

export const generateAISong = async(req,res) =>{
    let sunoApiUrl = process.env.SUNO_API_URL;
    let question = req.query.message;
    if(question.length > 4096){
      res.status(500).json({ error: 'Prompt message exceed 4096' });
    }
    console.log(question);
    console.log(sunoApiUrl);
    const body = {
      prompt: question,
      make_instrumental: false,
      wait_audio: true
    };
    const response = await fetch(`${sunoApiUrl}/generate`, {
      method: 'post',
      body: JSON.stringify(body),
      headers: {'Content-Type': 'application/json'}
    });
    const data = await response.json();
  
    console.log(data);
    res.status(200).json(data);
  };
  