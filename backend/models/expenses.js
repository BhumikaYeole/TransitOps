import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },

    category: {
      type: String,
      enum: [
        "Fuel",
        "Maintenance",
        "Toll",
        "Insurance",
        "Miscellaneous",
      ],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    description: String,

    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Expense = mongoose.model("Expense", expenseSchema);

export default Expense;