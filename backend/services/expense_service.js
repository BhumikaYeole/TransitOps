import mongoose from "mongoose";
import Expense from "../models/expenses.js";
import Vehicle from "../models/vehicles.js";

class ExpenseService {
  /**
   * Create a new expense record (runs inside a database transaction)
   * @param {Object} data - Expense details
   * @returns {Promise<Object>} The created expense document
   */
  async createExpense(data) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { vehicle: vehicleId, category, amount, description, date } = data;

      // 1. Validate amount
      if (amount <= 0) {
        const error = new Error("Amount must be greater than zero");
        error.statusCode = 400;
        throw error;
      }

      // 2. Fetch and validate Vehicle exists
      const vehicle = await Vehicle.findById(vehicleId).session(session);
      if (!vehicle) {
        const error = new Error("Vehicle not found");
        error.statusCode = 404;
        throw error;
      }

      // 3. Create Expense log
      const expense = new Expense({
        vehicle: vehicleId,
        category,
        amount,
        description,
        date: date || new Date(),
      });

      const savedExpense = await expense.save({ session });

      await session.commitTransaction();
      return savedExpense;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Retrieve list of expenses with pagination and filter options (by vehicle, category, and date range)
   * @param {Object} query - Query parameters (vehicle, category, startDate, endDate, page, limit)
   * @returns {Promise<Object>} Paginated list of expenses
   */
  async getExpenses(query) {
    const { vehicle, category, startDate, endDate, page = 1, limit = 10 } = query;
    const filter = {};

    if (vehicle) {
      filter.vehicle = vehicle;
    }
    if (category) {
      filter.category = category;
    }
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const skipIndex = (page - 1) * limit;

    const [expenses, totalCount] = await Promise.all([
      Expense.find(filter)
        .populate("vehicle")
        .sort({ date: -1 })
        .limit(Number(limit))
        .skip(skipIndex),
      Expense.countDocuments(filter),
    ]);

    return {
      expenses,
      pagination: {
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: Number(page),
        limit: Number(limit),
      },
    };
  }

  /**
   * Return monthly expense totals grouped by month and category, optionally filtered by vehicle and year
   * @param {Object} query - Filter parameters (vehicle, year)
   * @returns {Promise<Array>} Monthly aggregated totals
   */
  async getMonthlyExpenseTotals(query) {
    const { vehicle, year } = query;
    const filter = {};

    if (vehicle) {
      filter.vehicle = new mongoose.Types.ObjectId(vehicle);
    }

    const targetYear = year ? Number(year) : new Date().getFullYear();
    filter.date = {
      $gte: new Date(`${targetYear}-01-01T00:00:00.000Z`),
      $lte: new Date(`${targetYear}-12-31T23:59:59.999Z`),
    };

    const result = await Expense.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            month: { $month: "$date" },
            category: "$category",
          },
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          month: "$_id.month",
          category: "$_id.category",
          totalAmount: 1,
          count: 1,
        },
      },
      { $sort: { month: 1, category: 1 } },
    ]);

    return result;
  }

  /**
   * Get a single expense record by ID
   * @param {string} id 
   * @returns {Promise<Object>} The expense document
   */
  async getExpenseById(id) {
    const expense = await Expense.findById(id).populate("vehicle");
    if (!expense) {
      const error = new Error("Expense record not found");
      error.statusCode = 404;
      throw error;
    }
    return expense;
  }

  /**
   * Update an expense record (runs inside a database transaction)
   * @param {string} id - Expense ID
   * @param {Object} updateData - Update payload
   * @returns {Promise<Object>} The updated expense record
   */
  async updateExpense(id, updateData) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const expense = await Expense.findById(id).session(session);
      if (!expense) {
        const error = new Error("Expense record not found");
        error.statusCode = 404;
        throw error;
      }

      const vehicleId = updateData.vehicle || expense.vehicle;
      const vehicle = await Vehicle.findById(vehicleId).session(session);
      if (!vehicle) {
        const error = new Error("Vehicle not found");
        error.statusCode = 404;
        throw error;
      }

      const targetAmount = updateData.amount !== undefined ? updateData.amount : expense.amount;
      if (targetAmount <= 0) {
        const error = new Error("Amount must be greater than zero");
        error.statusCode = 400;
        throw error;
      }

      // Apply updates
      const fieldsToUpdate = ["vehicle", "category", "amount", "description", "date"];
      fieldsToUpdate.forEach((field) => {
        if (updateData[field] !== undefined) {
          expense[field] = updateData[field];
        }
      });

      const updatedExpense = await expense.save({ session });

      await session.commitTransaction();
      return updatedExpense;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Delete an expense record
   * @param {string} id 
   * @returns {Promise<Object>} The deleted expense document
   */
  async deleteExpense(id) {
    const expense = await Expense.findByIdAndDelete(id);
    if (!expense) {
      const error = new Error("Expense record not found");
      error.statusCode = 404;
      throw error;
    }
    return expense;
  }
}

export default new ExpenseService();
