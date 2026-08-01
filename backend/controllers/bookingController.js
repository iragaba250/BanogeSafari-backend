import Booking from '../models/Booking.js';
import Tour from '../models/Tour.js';
import { errorResponse } from '../utils/errorHandler.js';

export const createBooking = async (req, res) => {
  try {
    const { tour: tourId, date, guests, name, email, phone, notes, paymentMethod } = req.body;

    if (typeof tourId !== 'string' || !date || !Number.isInteger(guests) || guests < 1) {
      return res.status(400).json({ message: 'Tour, date and a positive guest count are required' });
    }

    const tour = await Tour.findById(tourId);
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }

    const totalPrice = tour.price * guests;

    const booking = await Booking.create({
      user: req.user._id,
      tour: tourId,
      date,
      guests,
      totalPrice,
      name: name || req.user.name,
      email: email || req.user.email,
      phone: phone || '',
      notes: notes || '',
      paymentMethod: paymentMethod || 'card',
    });

    const populated = await Booking.findById(booking._id);

    res.status(201).json({ booking: populated });
  } catch (error) {
    errorResponse(res, error, 'Could not create booking');
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).sort('-createdAt');
    res.json({ count: bookings.length, bookings });
  } catch (error) {
    errorResponse(res, error);
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort('-createdAt');
    res.json({ count: bookings.length, bookings });
  } catch (error) {
    errorResponse(res, error);
  }
};

export const getPendingCount = async (req, res) => {
  try {
    const since = req.query.since;
    const filter = { status: 'pending' };
    if (since && !Number.isNaN(Date.parse(since))) {
      filter.createdAt = { $gt: new Date(since) };
    }
    const count = await Booking.countDocuments(filter);
    res.json({ count });
  } catch (error) {
    errorResponse(res, error);
  }
};

export const getStats = async (req, res) => {
  try {
    const bookings = await Booking.find();

    const totalBookings = bookings.length;
    const cancelledBookings = bookings.filter((b) => b.status === 'cancelled').length;
    const activeBookings = totalBookings - cancelledBookings;
    const revenue = bookings
      .filter((b) => b.status !== 'cancelled')
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    const statusBreakdown = {
      pending: bookings.filter((b) => b.status === 'pending').length,
      confirmed: bookings.filter((b) => b.status === 'confirmed').length,
      cancelled: cancelledBookings,
    };

    const popularTours = await Booking.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: '$tour',
          bookings: { $sum: 1 },
          guests: { $sum: '$guests' },
          revenue: { $sum: '$totalPrice' },
        },
      },
      { $sort: { bookings: -1, revenue: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'tours', localField: '_id', foreignField: '_id', as: 'tour' } },
      { $unwind: { path: '$tour', preserveNullAndEmptyArrays: true } },
    ]);

    res.json({
      stats: {
        totalBookings,
        activeBookings,
        cancelledBookings,
        revenue,
        statusBreakdown,
        popularTours,
      },
    });
  } catch (error) {
    errorResponse(res, error);
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = status;
    await booking.save();

    res.json({ booking });
  } catch (error) {
    errorResponse(res, error);
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ booking });
  } catch (error) {
    errorResponse(res, error);
  }
};
