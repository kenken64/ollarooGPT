import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import mongoose from 'mongoose';
import Fruit from '@/app/models/Fruit';

// Handle PATCH request to update a fruit by ID
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  
  try {
    // Validate the ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error('Invalid ID format:', id);
      return NextResponse.json({ success: false, message: 'Invalid ID format' }, { status: 400 });
    }
    await dbConnect();
    const headers = req.headers;
    const userEmail = headers.get('X-usermail');
    const existingObjectId = new mongoose.Types.ObjectId(id);
    const body = await req.json();
    const fruit = await Fruit.findById(existingObjectId);
    const updatedFruit = await Fruit.findByIdAndUpdate(existingObjectId, { name: body.name, url: body.url, email: userEmail }, 
            { new: false, runValidators: true });

    if (!updatedFruit) {
      return NextResponse.json({ success: false, message: 'Fruit not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updatedFruit });
  } catch (error) {
    console.error('Error updating fruit:', error);
    return NextResponse.json({ success: false, message: 'Error updating fruit' }, { status: 400 });
  }
}

// DELETE function to delete a fruit by ID
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    // Connect to the database
    await dbConnect();

    // Validate the ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error('Invalid ID format:', id);
      return NextResponse.json({ success: false, message: 'Invalid ID format' }, { status: 400 });
    }

    // Convert string ID to ObjectId
    const objectId = new mongoose.Types.ObjectId(id);

    // Delete the document by ID
    const deletedFruit = await Fruit.findByIdAndDelete(objectId);

    // Handle the case where the document is not found
    if (!deletedFruit) {
      console.error('No fruit found with the given ID:', id);
      return NextResponse.json({ success: false, message: 'Fruit not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Fruit deleted successfully' });
  } catch (error) {
    console.error('Error deleting fruit:', error);
    return NextResponse.json({ success: false, message: 'Error deleting fruit' }, { status: 400 });
  }
}