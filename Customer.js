const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  customerId: { type: String, required: true, unique: true }, // e.g. CUST-1001
  companyName: { type: String, required: true, trim: true },
  contactPerson: { type: String, required: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, lowercase: true, trim: true },
  gstin: { type: String, uppercase: true, trim: true },
  panNumber: { type: String, uppercase: true, trim: true },
  billingAddress: { type: String, required: true },
  shippingAddress: { type: String },
  state: { type: String, default: 'Telangana' },
  pincode: { type: String },
  industry: { type: String, default: 'Power & Infrastructure' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  outstandingBalance: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.models.Customer || mongoose.model('Customer', customerSchema);