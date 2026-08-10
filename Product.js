const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
  productName: { type: String, required: true, trim: true },
  category: { 
    type: String, 
    enum: [
      'Transmission Towers', 
      'Substation Structures', 
      'GI Earthing Strip', 
      'Solar Structures', 
      'PEB Structures', 
      'Structural Fabrication'
    ], 
    required: true 
  },
  hsnCode: { type: String, default: '7308' },
  unit: { type: String, enum: ['MT', 'Kg', 'Pcs', 'Mtrs'], default: 'MT' },
  unitWeightKg: { type: Number, default: 0 },
  standardRatePerUnit: { type: Number, required: true },
  steelGrade: { type: String, default: 'IS 2062 E250' }
}, { timestamps: true });

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);