const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  type: { type: String, enum: ['IN', 'OUT'], required: true },
  quantity: { type: Number, required: true, min: 1 },
  previousQuantity: { type: Number, required: true, min: 0 },
  newQuantity: { type: Number, required: true, min: 0 },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  destination: { type: String },
  referenceNumber: { type: String, required: true },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  notes: { type: String }
}, { timestamps: { createdAt: 'timestamp', updatedAt: false } });

module.exports = mongoose.model('StockMovement', stockMovementSchema);
