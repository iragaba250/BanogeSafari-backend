export const errorResponse = (res, error, fallback = 'Internal server error') => {
  if (error.name === 'ValidationError') {
    return res.status(400).json({ message: error.message });
  }
  if (error.code === 11000) {
    return res.status(409).json({ message: 'Duplicate value entered' });
  }
  if (error.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }
  return res.status(500).json({ message: fallback });
};
