import { NextRequest, NextResponse } from "next/server";
import bcrypt from 'bcryptjs';
import dbConnect from '@/app/lib/dbConnect';
import User from '@/app/models/User';

export async function POST(req: NextRequest){
    try{
        await dbConnect();
        const body = await req.json();
        const { email, password } = body;
        console.log(email)
        console.log(password)
        if (!email || !password) {
            return NextResponse.json({ message: 'Please provide all required fields' }, { status: 400 });
          }
      
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ message: 'User already exists' }, { status: 400 });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ email, password: hashedPassword });
        return NextResponse.json({message:'User registered successfully', user}, {status: 201});
    }catch(error){
        return NextResponse.json({ message: 'Internal server error', error }, { status: 500 });
    }
}