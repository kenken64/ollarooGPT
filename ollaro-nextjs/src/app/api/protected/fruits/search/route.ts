import { NextRequest, NextResponse} from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import Fruit from '@/app/models/Fruit';

export async function GET(req: NextRequest) {
    try {
      // Connect to the database
      await dbConnect();
  
      // Extract the search query from the request
      const searchParams = new URL(req.url).searchParams;
      const query = searchParams.get('q') || '';
      const headers = req.headers;
      const userEmail = headers.get('X-usermail');
      // Find fruits whose name matches the search query, case insensitive
      const fruits = await Fruit.find({ name: { $regex: query, $options: 'i' }, email: userEmail });
  
      return NextResponse.json({ success: true, data: fruits });
    } catch (error) {
      console.error('Error searching fruits:', error);
      return NextResponse.json({ success: false, message: 'Error searching fruits' }, { status: 400 });
    }
}