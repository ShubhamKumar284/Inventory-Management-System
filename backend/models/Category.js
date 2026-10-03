const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String }
}, { timestamps: { createdAt: true, updatedAt: false } });

module.exports = mongoose.model('Category', categorySchema);
