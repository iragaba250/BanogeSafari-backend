import mongoose from 'mongoose';

const tourSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    duration: {
      type: String,
      required: [true, 'Duration is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },
    category: {
      type: String,
      required: true,
      enum: ['trekking', 'beach', 'cultural', 'safari'],
    },
    image: {
      type: String,
      default: '',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    maxGroupSize: {
      type: Number,
      default: 20,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Tour', tourSchema);
