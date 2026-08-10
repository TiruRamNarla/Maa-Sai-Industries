const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  itemCategory: { 
    type: String, 
    enum: [
      'Steel Angles', 
      'Channels', 
      'Flats', 
      'Plates', 
      'Bolts & Nuts', 
      'Zinc', 
      'Electrodes'
    ], 
    required: true 
  },
  itemName: { type: String, required: true },
  stockQty: { type: Number, required: true, default: 0 },
  unit: { type: String, enum: ['MT', 'Kg', 'Pcs', 'Bags'], default: 'MT' },
  minimumStock: { type: Number, required: true, default: 5 },
  supplier: { type: String, default: 'Primary Steel Vendor' },
  lastUpdatedBy: { type: String, default: 'System Admin' }
}, { timestamps: true });

module.exports = mongoose.models.Inventory || mongoose.model('Inventory', inventorySchema);