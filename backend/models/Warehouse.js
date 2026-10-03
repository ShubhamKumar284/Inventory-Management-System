const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  location: { type: String },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  capacity: { type: Number },
  imageUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Warehouse', warehouseSchema);
