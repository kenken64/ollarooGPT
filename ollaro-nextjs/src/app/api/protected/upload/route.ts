import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand, PutObjectAclCommand, ObjectCannedACL } from '@aws-sdk/client-s3';
import { IncomingForm, File } from "formidable";
import { promises as fs } from "fs";
import { Readable } from "stream";
import { IncomingMessage } from 'http';
import dbConnect from '@/app/lib/dbConnect';
import mongoose from 'mongoose';
import Fruit from '@/app/models/Fruit';
import logger from '@/app/utils/logger';

const s3 = new S3Client({
  region: 'sgp1', // Replace with your DigitalOcean region
  endpoint: 'https://sgp1.digitaloceanspaces.com', // Replace with your endpoint
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY || '',
    secretAccessKey: process.env.DO_SPACES_SECRET || '',
  },
});

// Define a custom type to extend Readable to mimic IncomingMessage
interface NodeRequestReadable extends Readable {
    headers: Record<string, string>;
    method?: string;
    url?: string;
    aborted?: boolean;
  }
  
  // Convert NextRequest to a mock Node.js IncomingMessage
  function nextRequestToNodeRequest(req: NextRequest): NodeRequestReadable {
    const { body } = req;
    const headers: Record<string, string> = {};
  
    // Copy all headers from NextRequest to a new headers object
    req.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });
  
    // Create a new readable stream and attach necessary headers and properties
    const readable = new Readable() as NodeRequestReadable;
    readable._read = () => {}; // _read is required but you can noop it
  
    readable.headers = headers; // Attach headers to mimic IncomingMessage
    readable.method = req.method || 'POST'; // Attach method
    readable.url = req.url || ''; // Attach url
    readable.aborted = false; // Set aborted to false initially
  
    if (body) {
      body.getReader().read().then(({ done, value }) => {
        if (!done && value) {
          readable.push(Buffer.from(value));
        }
        readable.push(null); // End the stream
      });
    }
  
    return readable;
  }
  
  // Utility function to parse form data using Formidable
  async function parseForm(req: NextRequest): Promise<{ fields: Record<string, any>; files: Record<string, File | File[] | undefined> }> {
    const nodeReq = nextRequestToNodeRequest(req); // Convert the request to NodeRequestReadable
  
    return new Promise((resolve, reject) => {
      const form = new IncomingForm();
  
      // Using type assertion to make TypeScript recognize nodeReq as IncomingMessage
      form.parse(nodeReq as IncomingMessage, (err, fields, files) => {
        if (err) {
          reject(err);
        } else {
          resolve({ fields, files });
        }
      });
    });
  }

  export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        // Parse the incoming form data manually
        // const { fields, file, fileName } = await parseFormData(req);
        const { fields, files } = await parseForm(req);
        // if (!fileName || !file) {
        //     return NextResponse.json({ success: false, message: 'File not found in request' }, { status: 400 });
        // }
        const uploadedFile = files.file;
        const uploadedSingleFile = Array.isArray(uploadedFile) ? uploadedFile[0] : uploadedFile;
        if (Array.isArray(uploadedSingleFile)) {
            // Handle multiple files (if the form allows multiple uploads)
            console.error("Only single file upload is supported.");
            return NextResponse.json({ error: "Only single file upload is supported" }, { status: 400 });
        }

        if (!uploadedSingleFile) {
            console.error("No file found in the request");
            return NextResponse.json({ error: "No file found in the request" }, { status: 400 });
        }

        const itemId = fields.itemId;
        if (!itemId) {
            return NextResponse.json({ success: false, message: 'Item ID is required' }, { status: 400 });
        }

        // TypeScript now knows that uploadedFile is a File object
        const filePath = uploadedSingleFile.filepath;

        // Read file data to store or process
        const data = await fs.readFile(filePath);
        logger.debug(uploadedFile);
        let filenamesExt = uploadedSingleFile.originalFilename?.split(".");
        
        // Define the file key and bucket
        const key = `uploads/${itemId}-${filenamesExt![0]}-${Date.now()}.${filenamesExt![1]}`; // Customize key as needed
        const bucket = process.env.DO_SPACES_BUCKET || '';
        let filenameExtMimeType = filenamesExt![1];
        let mimeType = `image/${filenameExtMimeType}`;
        logger.debug(mimeType);
        // Upload the file to DigitalOcean Spaces
        const uploadParams = {
            Bucket: bucket,
            Key: key,
            Body: data,
            ContentType: mimeType, // Adjust Content-Type as needed (e.g., 'image/png')
        };
  
        await s3.send(new PutObjectCommand(uploadParams));

        // Set the object ACL to public-read
        const aclParams = {
            Bucket: bucket,
            Key: key,
            ACL: 'public-read' as ObjectCannedACL,
        };
        await s3.send(new PutObjectAclCommand(aclParams));
        // Construct the URL for accessing the file
        const fileUrl = `https://${bucket}.sgp1.cdn.digitaloceanspaces.com/${key}`;
        const _itemId= itemId;
        const existingObjectId = new mongoose.Types.ObjectId(_itemId[0]);
        const fruit = await Fruit.findById(existingObjectId);
        await Fruit.findByIdAndUpdate(existingObjectId, { name: fruit?.name , url: fileUrl }, 
            { new: false, runValidators: false });

        return NextResponse.json({ success: true, message: fileUrl }, { status: 200 });
    } catch (error) {
      console.error('Error uploading to S3:', error);
      return NextResponse.json({ success: false, message: 'Error uploading file' }, { status: 500 });
    }
  }
  
export const config = {
    api: {
        bodyParser: false, // Disable built-in body parser to handle file uploads with formidable
    },
};