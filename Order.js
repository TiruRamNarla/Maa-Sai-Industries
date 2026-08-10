const mongoose = require('mongoose');

const timelineEntrySchema = new mongoose.Schema({
  stageName: { type: String, required: true },
  status: { type: String, default: 'Completed' },
  remarks: { type: String, default: '' },
  updatedBy: { type: String, default: 'System Admin' },
  timestamp: { type: Date, default: Date.now }
});

const stageSchema = new mongoose.Schema({
  stageName: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
  assignedEmployee: { type: String, default: 'Unassigned' },
  updatedAt: { type: Date, default: Date.now },
  remarks: { type: String, default: '' }
});

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  customerName: { type: String, required: true },
  project: { type: String, default: 'General Structure Fabrication' },
  item: { type: String, required: true },
  amount: { type: Number, required: true },
  
  // Real Manufacturing Data
  drawingNumber: { type: String, default: 'DWG-001' },
  revisionNumber: { type: String, default: 'R0' },
  steelGrade: { type: String, default: 'IS 2062 E250' },
  totalWeightMT: { type: Number, default: 0 },
  galvanizingBatchNo: { type: String, default: '' },
  
  expectedDispatch: { type: Date },
  currentStage: { 
    type: String, 
    default: 'Order',
    enum: [
      'Order', 'Planning', 'Raw Material', 'Fabrication', 
      'Punching', 'Drilling', 'Galvanizing', 'Inspection', 
      'Packing', 'Dispatch', 'Delivered'
    ]
  },
  stages: [stageSchema],
  historyTimeline: [timelineEntrySchema]
}, { timestamps: true });

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);