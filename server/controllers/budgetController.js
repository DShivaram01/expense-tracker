import Budget from '../models/Budget.js';

// @desc    Get the budget (creates default if missing)
// @route   GET /api/budget
export const getBudget = async (req, res) => {
  try {
    let budget = await Budget.findOne({ singleton: 'budget' });
    if (!budget) {
      budget = await Budget.create({ amount: 2000 });
    }
    res.json(budget);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch budget', error: error.message });
  }
};

// @desc    Update the budget
// @route   PUT /api/budget
export const updateBudget = async (req, res) => {
  try {
    const { amount } = req.body;

    if (amount == null || amount < 0) {
      return res.status(400).json({ message: 'Valid budget amount required' });
    }

    let budget = await Budget.findOne({ singleton: 'budget' });
    if (!budget) {
      budget = await Budget.create({ amount: Number(amount) });
    } else {
      budget.amount = Number(amount);
      await budget.save();
    }

    res.json(budget);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update budget', error: error.message });
  }
};
