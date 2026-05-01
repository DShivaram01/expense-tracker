import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: 200,
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must be positive'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['food', 'transport', 'shopping', 'entertainment', 'bills', 'health', 'education', 'other'],
      message: 'Invalid category',
    },
  },
  date: {
    type: String,
    required: [true, 'Date is required'],
  },
}, {
  timestamps: true,
});

export default mongoose.model('Expense', expenseSchema);
