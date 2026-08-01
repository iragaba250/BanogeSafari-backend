import mongoose from 'mongoose';

const contactMessageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Name is required'],
      maxlength: 80,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, 'Email is required'],
      maxlength: 120,
    },
    subject: {
      type: String,
      trim: true,
      required: [true, 'Subject is required'],
      maxlength: 150,
    },
    message: {
      type: String,
      trim: true,
      required: [true, 'Message is required'],
      maxlength: 5000,
    },
    status: {
      type: String,
      enum: ['new', 'read'],
      default: 'new',
    },
  },
  { timestamps: true }
);

export default mongoose.model('ContactMessage', contactMessageSchema);
