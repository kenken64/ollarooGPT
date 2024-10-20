import mongoose, { Document, Model, Schema } from 'mongoose';

interface IFruit extends Document {
  name: string;
  url: string;
  email: string;
}

const FruitSchema: Schema<IFruit> = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: false,
  },
});

const Fruit: Model<IFruit> = mongoose.models.Fruit || mongoose.model<IFruit>('Fruit', FruitSchema);

export default Fruit;