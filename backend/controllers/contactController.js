import ContactMessage from '../models/ContactMessage.js';
import { errorResponse } from '../utils/errorHandler.js';

export const createMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'Name, email, subject and message are required' });
    }
    const contactMessage = await ContactMessage.create({ name, email, subject, message });
    res.status(201).json({ message: 'Message sent successfully', contactMessage });
  } catch (error) {
    errorResponse(res, error, 'Could not send message');
  }
};

export const getNewMessageCount = async (req, res) => {
  try {
    const count = await ContactMessage.countDocuments({ status: 'new' });
    res.json({ count });
  } catch (error) {
    errorResponse(res, error);
  }
};

export const getMessages = async (req, res) => {
  try {
    const filter = req.query.status ? { status: req.query.status } : {};
    const messages = await ContactMessage.find(filter).sort('-createdAt');
    res.json({ count: messages.length, messages });
  } catch (error) {
    errorResponse(res, error);
  }
};

export const updateMessage = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['new', 'read'].includes(status)) {
      return res.status(400).json({ message: 'Status must be "new" or "read"' });
    }
    const contactMessage = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!contactMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.json({ contactMessage });
  } catch (error) {
    errorResponse(res, error);
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const contactMessage = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!contactMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.json({ message: 'Message deleted' });
  } catch (error) {
    errorResponse(res, error);
  }
};
