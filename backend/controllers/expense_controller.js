import ExpenseService from "../services/expense_service.js";

export const createExpense = async (req, res, next) => {
  try {
    const record = await ExpenseService.createExpense(req.body);
    res.status(201).json({
      success: true,
      message: "Expense record created successfully",
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

export const getExpenses = async (req, res, next) => {
  try {
    const result = await ExpenseService.getExpenses(req.query);
    res.status(200).json({
      success: true,
      message: "Expense records retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getMonthlyExpenseTotals = async (req, res, next) => {
  try {
    const result = await ExpenseService.getMonthlyExpenseTotals(req.query);
    res.status(200).json({
      success: true,
      message: "Monthly expense totals retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getExpenseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const record = await ExpenseService.getExpenseById(id);
    res.status(200).json({
      success: true,
      message: "Expense record retrieved successfully",
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

export const updateExpense = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedRecord = await ExpenseService.updateExpense(id, req.body);
    res.status(200).json({
      success: true,
      message: "Expense record updated successfully",
      data: updatedRecord,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteExpense = async (req, res, next) => {
  try {
    const { id } = req.params;
    await ExpenseService.deleteExpense(id);
    res.status(200).json({
      success: true,
      message: "Expense record deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
