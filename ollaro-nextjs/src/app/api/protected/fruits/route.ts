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
    const fruits = await Fruit.find({});
    return NextResponse.json({ success: true, data: fruits });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    await dbConnect();
    try {
        const fruit = await Fruit.create(body);
        return NextResponse.json({ success: true, data: fruit });
      } catch (error) {
        return NextResponse.json({ success: false }, { status: 500 });
      }
}

