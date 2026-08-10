const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  product: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['New', 'Contacted', 'Converted', 'Closed'], default: 'New' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Lead', leadSchema);