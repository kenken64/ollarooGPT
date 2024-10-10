import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { IncomingForm, File } from "formidable";
import { promises as fs } from "fs";

const s3 = new S3Client({
  region: 'sgp1', // Replace with your DigitalOcean region
  endpoint: 'https://sgp1.digitaloceanspaces.com', // Replace with your endpoint
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY || '',
    secretAccessKey: process.env.DO_SPACES_SECRET || '',
  },
});

// Helper function to parse multipart/form-data without formidable
async function parseFormData(req: NextRequest): Promise<{ fields: Record<string, string>; file: Buffer | null; fileName: string | null }> {
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      throw new Error('Invalid content-type, expected multipart/form-data');
    }
  
    const boundary = contentType.split('boundary=')[1];
    if (!boundary) {
      throw new Error('No boundary found in content-type');
    }
  
    const reader = req.body?.getReader();
    if (!reader) {
      throw new Error('No readable stream found in request');
    }
  
    const decoder = new TextDecoder();
    let done = false;
    const chunks: Uint8Array[] = [];
  
    while (!done) {
      const { value, done: readerDone } = await reader.read();
      if (value) {
        chunks.push(value);
      }
      done = readerDone;
    }
  
    const fullBuffer = Buffer.concat(chunks);
    const text = decoder.decode(fullBuffer);
  
    // Manually parse the form data based on the boundary
    const parts = text.split(`--${boundary}`);
    const fields: Record<string, string> = {};
    let fileBuffer: Buffer | null = null;
    let fileName: string | null = null;
  
    for (const part of parts) {
      if (part === '--' || part.trim() === '') continue;
  
      const [header, body] = part.split('\r\n\r\n');
      if (header && body) {
        if (header.includes('Content-Disposition: form-data;')) {
          const nameMatch = header.match(/name="([^"]+)"/);
          const filenameMatch = header.match(/filename="([^"]+)"/);
  
          if (filenameMatch && nameMatch) {
            fileName = filenameMatch[1];
            const contentTypeMatch = header.match(/Content-Type: ([^\s]+)/);
            if (contentTypeMatch) {
              const bodyIndex = text.indexOf(body);
              const start = bodyIndex + 4;
              const end = text.indexOf(`--${boundary}`, start);
              fileBuffer = fullBuffer.slice(start, end);
            }
          } else if (nameMatch) {
            fields[nameMatch[1]] = body.trim();
          }
        }
      }
    }
  
    return { fields, file: fileBuffer, fileName };
  }

  export async function POST(req: NextRequest) {
    try {
        // Parse the incoming form data manually
        const { fields, file, fileName } = await parseFormData(req);

        if (!fileName || !file) {
            return NextResponse.json({ success: false, message: 'File not found in request' }, { status: 400 });
        }

        const itemId = fields.itemId;
        if (!itemId) {
            return NextResponse.json({ success: false, message: 'Item ID is required' }, { status: 400 });
        }

        console.log(">>>>> " + fileName);
        let filenamesExt = fileName.split(".");
        console.log(file);

        // Define the file key and bucket
        const key = `uploads/${itemId}-${filenamesExt[0]}-${Date.now()}.${filenamesExt[1]}`; // Customize key as needed
        const bucket = process.env.DO_SPACES_BUCKET || '';
        let filenameExtMimeType = filenamesExt[1];
        let mimeType = `image/${filenameExtMimeType}`;
        console.log(mimeType);
        // Upload the file to DigitalOcean Spaces
        const uploadParams = {
            Bucket: bucket,
            Key: key,
            Body: file,
            ContentType: mimeType, // Adjust Content-Type as needed (e.g., 'image/png')
            ACL: 'public-read',
        };
  
        let uploadResponse = await s3.send(new PutObjectCommand(uploadParams));
        // Construct the URL for accessing the file
        const fileUrl = `https://${bucket}.sgp1.digitaloceanspaces.com/upload/${key}`;
        console.log(fileUrl);
        console.log(uploadResponse);
        console.log(itemId);
        return NextResponse.json({ success: true, message: 'File uploaded successfully' });
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