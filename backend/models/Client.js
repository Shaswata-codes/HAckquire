const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, lowercase: true, trim: true, default: '' },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  company: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Client', clientSchema);
