const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  sku: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  description: { type: String },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  quantity: { type: Number, default: 0, min: 0 },
  minimumStock: { type: Number, default: 0 },
  unitCost: { type: Number, required: true },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
  location: { type: String },
  imageUrl: { type: String },
  expiryDate: { type: Date },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
