import { NextRequest, NextResponse} from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import Fruit from '@/app/models/Fruit';

type Data = {
    success: boolean;
    data?: any;
};

  
export async function GET(request: NextRequest) {
  await dbConnect();
  try {
    const headers = request.headers;
    const userEmail = headers.get('X-usermail');
    const fruits = await Fruit.find({ email: userEmail });
    return NextResponse.json({ success: true, data: fruits });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
    const headers = request.headers;
    const userEmail = headers.get('X-usermail');
    console.log(userEmail)
    const body = await request.json();
    const modifiedBody = {
      ...body, 
      email: userEmail,
    };
    await dbConnect();
    try {
        const fruit = await Fruit.create(modifiedBody);
        return NextResponse.json({ success: true, data: fruit });
      } catch (error) {
        return NextResponse.json({ success: false }, { status: 500 });
      }
}

