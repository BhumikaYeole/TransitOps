import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },

    type: {
      type: String,
      enum: [
        "FUEL",
        "MAINTENANCE",
        "TOLL",
        "OTHER",
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

module.exports = mongoose.model("Expense", expenseSchema);