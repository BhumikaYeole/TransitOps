import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },

    model: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["truck", "van", "bike", "car", "bus"],
      required: true,
      lowercase : true
    },

    maxLoadCapacity: {
      type: Number,
      required: true,
    },

    odometer: {
      type: Number,
      default: 0,
    },

    acquisitionCost: {
      type: Number,
      required: true,
    },

    region: {
      type: String,
    },

    status: {
      type: String,
      enum: [
        "AVAILABLE",
        "ON_TRIP",
        "IN_SHOP",
        "RETIRED",
      ],
      default: "AVAILABLE",
    },
  },
  { timestamps: true }
);

const Vehicle = mongoose.model("Vehicle", vehicleSchema);

export default Vehicle;