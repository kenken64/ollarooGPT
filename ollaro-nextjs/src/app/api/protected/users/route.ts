'use server';

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import User from '@/app/models/User';

export async function GET(request: NextRequest) {
  console.log("get users")
  try {
    // Connect to the database
    await dbConnect();

    // Extract query parameters from the request
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    

    // Validate required query parameters
    if (!email) {
      return NextResponse.json({ error: 'Email are required' }, { status: 400 });
    }

    // Retrieve users based on the given email and role
    const users = await User.find({ email });

    // Respond with the retrieved users
    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
