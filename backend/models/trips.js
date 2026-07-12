import mongoose from "mongoose";

const tripSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      required: true,
    },

    destination: {
      type: String,
      required: true,
    },

    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },

    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      required: true,
    },

    cargoWeight: {
      type: Number,
      required: true,
    },

    plannedDistance: {
      type: Number,
      required: true,
    },

    actualDistance: {
      type: Number,
      default: 0,
    },

    fuelConsumed: {
      type: Number,
      default: 0,
    },

    startOdometer: Number,

    endOdometer: Number,

    revenue: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: [
        "DRAFT",
        "DISPATCHED",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "DRAFT",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Trip", tripSchema);