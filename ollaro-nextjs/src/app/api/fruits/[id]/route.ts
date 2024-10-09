import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import Fruit from '@/app/models/Fruit';

// Handle PATCH request to update a fruit by ID
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    await dbConnect();

    const body = await req.json();
    const updatedFruit = await Fruit.findByIdAndUpdate(id, { name: body.name }, 
            { new: true, runValidators: true });

    if (!updatedFruit) {
      return NextResponse.json({ success: false, message: 'Fruit not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedFruit });
  } catch (error) {
    console.error('Error updating fruit:', error);
    return NextResponse.json({ success: false, message: 'Error updating fruit' }, { status: 400 });
  }
}