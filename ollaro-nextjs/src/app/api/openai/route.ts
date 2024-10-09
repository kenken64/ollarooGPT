import { DEFAULT_OPENAI_MODEL } from "@/app/shared/Constants";
import { OpenAIModel } from "@/app/types/Model";
import * as dotenv from "dotenv";
import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from 'openai';
import { NextRequest, NextResponse} from 'next/server';


// Get your environment variables
dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // This is the default and can be omitted
});

export async function POST(request: NextRequest) {
  console.log(request);
  const body = request.body;
  console.log(body);
  //const messages = (body?.messages || []);
  //const model = (body?.model || DEFAULT_OPENAI_MODEL) as OpenAIModel;

  
  return NextResponse.json({ message: 'OpenAPI!' })
}

/*
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const body = req.body;
  const messages = (body?.messages || []);
  const model = (body?.model || DEFAULT_OPENAI_MODEL) as OpenAIModel;

  try {
    const completion = await openai.chat.completions.create({
      model: model.id,
      temperature: 0.5,
      messages: [{ role: 'user', content: messages }],
    });

    //const responseMessage = completion.data.choices[0].message?.content.trim();
    console.log(completion);
    const responseMessage = completion;

    if (!responseMessage) {
      res
        .status(400)
        .json({ error: "Unable get response from OpenAI. Please try again." });
    }

    res.status(200).json({ message: responseMessage });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "An error occurred during ping to OpenAI. Please try again.",
    });
  }
}*/