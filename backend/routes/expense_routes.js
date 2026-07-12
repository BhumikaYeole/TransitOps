import { Router } from "express";
import { body } from "express-validator";
import {
  createExpense,
  getExpenses,
  getMonthlyExpenseTotals,
  getExpenseById,
  updateExpense,
  deleteExpense,
} from "../controllers/expense_controller.js";
import { validateRequest } from "../middleware/validation_middleware.js";

const expenseRouter = Router();

// Create Expense Validation Rules
const createExpenseValidation = [
  body("vehicle")
    .isMongoId()
    .withMessage("A valid Vehicle ID is required"),
  body("category")
    .trim()
    .notEmpty()
    .withMessage("Expense category is required")
    .isIn(["Fuel", "Maintenance", "Toll", "Insurance", "Miscellaneous"])
    .withMessage("Category must be Fuel, Maintenance, Toll, Insurance, or Miscellaneous"),
  body("amount")
    .notEmpty()
    .withMessage("Expense amount is required")
    .isFloat({ gt: 0 })
    .withMessage("Amount must be greater than zero"),
  body("date")
    .optional()
    .isISO8601()
    .withMessage("Date must be a valid ISO8601 date"),
  body("description")
    .optional()
    .trim(),
];

// Update Expense Validation Rules
const updateExpenseValidation = [
  body("vehicle")
    .optional()
    .isMongoId()
    .withMessage("Must be a valid Vehicle ID"),
  body("category")
    .optional()
    .trim()
    .isIn(["Fuel", "Maintenance", "Toll", "Insurance", "Miscellaneous"])
    .withMessage("Category must be Fuel, Maintenance, Toll, Insurance, or Miscellaneous"),
  body("amount")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("Amount must be greater than zero"),
  body("date")
    .optional()
    .isISO8601()
    .withMessage("Date must be a valid ISO8601 date"),
  body("description")
    .optional()
    .trim(),
];

// Monthly totals route (registered before /:id parameter matching)
expenseRouter.get("/totals/monthly", getMonthlyExpenseTotals);

expenseRouter.route("/")
  .post(createExpenseValidation, validateRequest, createExpense)
  .get(getExpenses);

expenseRouter.route("/:id")
  .get(getExpenseById)
  .put(updateExpenseValidation, validateRequest, updateExpense)
  .delete(deleteExpense);

export default expenseRouter;
