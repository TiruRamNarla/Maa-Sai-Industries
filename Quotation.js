const mongoose = require('mongoose');

const quotationItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  hsnCode: { type: String, default: '7308' },
  quantity: { type: Number, required: true, default: 1 },
  unit: { type: String, default: 'MT' },
  ratePerUnit: { type: Number, required: true },
  amount: { type: Number, required: true }
});

const quotationSchema = new mongoose.Schema({
  quotationNumber: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  customerEmail: { type: String, default: '' },
  companyName: { type: String, default: 'Valued Client' },
  gstin: { type: String, default: '' },
  items: [quotationItemSchema],
  totalAmount: { type: Number, required: true },
  taxAmount: { type: Number, required: true }, // 18% GST
  grandTotal: { type: Number, required: true },
  terms: { type: String, default: '1. 100% advance or against delivery. 2. Taxes as applicable (18% GST).' },
  status: { 
    type: String, 
    enum: ['Issued', 'Accepted', 'Rejected', 'Converted to Order'], 
    default: 'Issued' 
  }
}, { timestamps: true });

module.exports = mongoose.models.Quotation || mongoose.model('Quotation', quotationSchema);