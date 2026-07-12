import TripService from "../services/trip_service.js";

export const createTrip = async (req, res, next) => {
  try {
    const trip = await TripService.createTrip(req.body);
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
    const result = await TripService.getTrips(req.query);
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
    const { id } = req.params;
    const trip = await TripService.getTripById(id);
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
    const { id } = req.params;
    const updatedTrip = await TripService.updateTrip(id, req.body);
    res.status(200).json({
      success: true,
      message: "Trip updated successfully",
      data: updatedTrip,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTrip = async (req, res, next) => {
  try {
    const { id } = req.params;
    await TripService.deleteTrip(id);
    res.status(200).json({
      success: true,
      message: "Trip deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
