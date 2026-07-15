import mongoose from "mongoose";

const driverSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    licenseNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    licenseCategory: {
      type: String,
      required: true,
      trim: true,
    },
    licenseExpiry: {
      type: Date,
      required: true,
    },
    contactNumber: {
      type: String,
      required: true,
      trim: true,
    },
    safetyScore: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ["AVAILABLE", "ON_TRIP", "OFF_DUTY", "SUSPENDED"],
      default: "AVAILABLE",
    },
  },
  { timestamps: true }
);

const Driver = mongoose.model("Driver", driverSchema);

export default Driver;