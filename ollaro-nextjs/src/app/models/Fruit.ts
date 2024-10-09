import mongoose, { Document, Model, Schema } from 'mongoose';

interface IFruit extends Document {
  name: string;
  _id: string;
}

const FruitSchema: Schema<IFruit> = new mongoose.Schema({
   _id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});

const Fruit: Model<IFruit> = mongoose.models.Fruit || mongoose.model<IFruit>('Fruit', FruitSchema);

export default Fruit;