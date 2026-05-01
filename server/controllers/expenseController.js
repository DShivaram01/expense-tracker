import Expense from '../models/Expense.js';

// @desc    Get all expenses
// @route   GET /api/expenses
export const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ createdAt: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch expenses', error: error.message });
  }
};

// @desc    Create a new expense
// @route   POST /api/expenses
export const createExpense = async (req, res) => {
  try {
    const { description, amount, category, date } = req.body;

    if (!description || amount == null || !category || !date) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const expense = await Expense.create({
      description,
      amount: Number(amount),
      category,
      date,
    });

    res.status(201).json(expense);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Failed to create expense', error: error.message });
  }
};

// @desc    Update an expense
// @route   PUT /api/expenses/:id
export const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update expense', error: error.message });
  }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    await expense.deleteOne();
    res.json({ message: 'Expense deleted', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete expense', error: error.message });
  }
};
