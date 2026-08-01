import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tour',
      required: true,
    },
    date: {
      type: Date,
      required: [true, 'Travel date is required'],
    },
    guests: {
      type: Number,
      required: [true, 'Number of guests is required'],
      min: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      trim: true,
      maxlength: 80,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'paypal', 'bank', 'cash'],
      default: 'card',
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

bookingSchema.pre(/^find/, function (next) {
  this.populate('user', 'name email').populate('tour', 'title location price');
  next();
});

export default mongoose.model('Booking', bookingSchema);
