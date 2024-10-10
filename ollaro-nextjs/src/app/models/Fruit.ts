import mongoose, { Document, Model, Schema } from 'mongoose';

interface IFruit extends Document {
  name: string;
}

const FruitSchema: Schema<IFruit> = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

const Fruit: Model<IFruit> = mongoose.models.Fruit || mongoose.model<IFruit>('Fruit', FruitSchema);

export default Fruit;