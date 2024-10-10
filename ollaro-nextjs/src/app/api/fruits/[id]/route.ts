import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import mongoose from 'mongoose';
import Fruit from '@/app/models/Fruit';

// Handle PATCH request to update a fruit by ID
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  console.log(id);
  
  try {
    // Validate the ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error('Invalid ID format:', id);
      return NextResponse.json({ success: false, message: 'Invalid ID format' }, { status: 400 });
    }
    await dbConnect();
    
    const existingObjectId = new mongoose.Types.ObjectId(id);
    console.log(existingObjectId);
    const body = await req.json();
    console.log(body.name);
    const fruit = await Fruit.findById(existingObjectId);
    console.log(fruit)
    const updatedFruit = await Fruit.findByIdAndUpdate(existingObjectId, { name: body.name, url: body.url }, 
            { new: false, runValidators: true });

    if (!updatedFruit) {
      console.log("////")
      return NextResponse.json({ success: false, message: 'Fruit not found' }, { status: 404 });
    }
    console.log(updatedFruit)
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