import { DEFAULT_OPENAI_MODEL } from "@/app/shared/Constants";
import { OpenAIModel } from "@/app/types/Model";
import * as dotenv from "dotenv";
import OpenAI from 'openai';
import { NextRequest, NextResponse} from 'next/server';


// Get your environment variables
dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // This is the default and can be omitted
});

export async function POST(request: NextRequest) {
  try{
    const body = await request.json();
    const messages = (body?.messages || []);
    const model = (body?.model || DEFAULT_OPENAI_MODEL) as OpenAIModel;
    const promptMessage = {
      role: "system",
      content: "You are ChatGPT. Respond to the user like you normally would.",
    };
    const initialMessages = messages.splice(
      0,
      3
    );
    const latestMessages = messages
      .slice(-5)
      .map((message: { role: any; content: any; }) => ({
        role: message.role,
        content: message.content,
      }));

    const completion = await openai.chat.completions.create({
      model: model.id,
      temperature: 0.5,
      messages: [promptMessage, ...initialMessages, ...latestMessages],
    });
    
    const responseMessage = completion.choices[0].message?.content?.trim();
    return NextResponse.json({ message:  responseMessage}, { status: 200 })
  }catch (error) {
    console.error(error);
    NextResponse.json({
      error: "An error occurred during ping to OpenAI. Please try again.",
    }, { status: 500 });
  }
}
