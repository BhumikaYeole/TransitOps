import {
  createTripService,
  updateTripService,
  dispatchTripService,
  completeTripService,
  cancelTripService,
  getTripsService,
  getTripByIdService,
  deleteTripService,
} from "../services/trip_service.js";

export const createTrip = async (req, res, next) => {
  try {
    const trip = await createTripService(req.body);

    res.status(201).json({
      success: true,
      message: "Trip created successfully",
      data: trip,
    });
  } catch (error) {
    next(error);
  }
};

export const getTrips = async (req, res, next) => {
  try {
    const result = await getTripsService(req.query);

    res.status(200).json({
      success: true,
      message: "Trips retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getTripById = async (req, res, next) => {
  try {
    const trip = await getTripByIdService(req.params.id);

    res.status(200).json({
      success: true,
      message: "Trip retrieved successfully",
      data: trip,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTrip = async (req, res, next) => {
  try {
    const trip = await updateTripService(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: "Trip updated successfully",
      data: trip,
    });
  } catch (error) {
    next(error);
  }
};

export const dispatchTrip = async (req, res, next) => {
  try {
    const trip = await dispatchTripService(req.params.id);

    res.status(200).json({
      success: true,
      message: "Trip dispatched successfully",
      data: trip,
    });
  } catch (error) {
    next(error);
  }
};

export const completeTrip = async (req, res, next) => {
  try {
    const { actualDistance, fuelConsumed } = req.body;

    const trip = await completeTripService(
      req.params.id,
      actualDistance,
      fuelConsumed
    );

    res.status(200).json({
      success: true,
      message: "Trip completed successfully",
      data: trip,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelTrip = async (req, res, next) => {
  try {
    const trip = await cancelTripService(req.params.id);

    res.status(200).json({
      success: true,
      message: "Trip cancelled successfully",
      data: trip,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTrip = async (req, res, next) => {
  try {
    const trip = await deleteTripService(req.params.id);

    res.status(200).json({
      success: true,
      message: "Trip deleted successfully",
      data: trip,
    });
  } catch (error) {
    next(error);
  }
};