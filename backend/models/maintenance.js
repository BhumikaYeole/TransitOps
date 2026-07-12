import mongoose from "mongoose";

const maintenanceSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    description: String,

    cost: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: [
        "ACTIVE",
        "COMPLETED",
      ],
      default: "ACTIVE",
    },

    openedDate: {
      type: Date,
      default: Date.now,
    },

    closedDate: Date,
  },
  { timestamps: true }
);

const Maintenance = mongoose.model("Maintenance", maintenanceSchema);
export default Maintenance;