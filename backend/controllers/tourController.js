import Tour from '../models/Tour.js';
import { errorResponse } from '../utils/errorHandler.js';

export const getTours = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.featured) filter.featured = req.query.featured === 'true';

    const tours = await Tour.find(filter).sort('-createdAt');
    res.json({ count: tours.length, tours });
  } catch (error) {
    errorResponse(res, error);
  }
};

export const getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }
    res.json({ tour });
  } catch (error) {
    errorResponse(res, error);
  }
};

export const createTour = async (req, res) => {
  try {
    const tour = await Tour.create(req.body);
    res.status(201).json({ tour });
  } catch (error) {
    errorResponse(res, error, 'Could not create tour');
  }
};

export const updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }
    res.json({ tour });
  } catch (error) {
    errorResponse(res, error, 'Could not update tour');
  }
};

export const deleteTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }
    res.json({ message: 'Tour deleted' });
  } catch (error) {
    errorResponse(res, error);
  }
};
