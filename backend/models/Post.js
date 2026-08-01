import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    excerpt: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      default: 'general',
      enum: ['general', 'news', 'tips', 'stories'],
    },
    image: {
      type: String,
      default: '',
    },
    author: {
      type: String,
      trim: true,
      default: 'BANOGE Safari',
    },
    published: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Post', postSchema);
