import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    default: 2000,
    min: 0,
  },
  // Singleton - only ever one budget document
  singleton: {
    type: String,
    default: 'budget',
    unique: true,
  },
}, {
  timestamps: true,
});

export default mongoose.model('Budget', budgetSchema);
