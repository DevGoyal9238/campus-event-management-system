const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/events
// @desc    Fetch all events from MongoDB sorted by date in ascending order
// @access  Public
router.get('/', async (req, res) => {
  try {
    // Query all event documents from MongoDB and sort by date ascending (1 = oldest to newest)
    const events = await Event.find().sort({ date: 1 });

    // Return 200 OK with the array of event objects in JSON format
    res.status(200).json(events);
  } catch (error) {
    // Log internal error message for debugging
    console.error(`Error fetching events: ${error.message}`);

    // Return 500 Internal Server Error to client
    res.status(500).json({
      message: 'Server error while fetching events'
    });
  }
});

// @route   GET /api/events/my-registrations
// @desc    Fetch all event registrations for the authenticated user with populated event details
// @access  Private (Protected by JWT)
router.get('/my-registrations', protect, async (req, res) => {
  try {
    // Query registrations belonging to the authenticated user, populate event details, and sort newest first
    const registrations = await Registration.find({ userId: req.userId })
      .populate('eventId', 'title date time venue description totalCapacity availableSeats')
      .sort({ createdAt: -1 });

    // Return 200 OK with the array of registration documents
    res.status(200).json({
      registrations
    });
  } catch (error) {
    // Log internal error for debugging
    console.error(`Error fetching user registrations: ${error.message}`);

    // Return 500 Internal Server Error without leaking internal details
    res.status(500).json({
      message: 'Server error while fetching registrations'
    });
  }
});

// @route   GET /api/events/:id
// @desc    Fetch a single event by its MongoDB ObjectId
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Query event document by its MongoDB _id
    const event = await Event.findById(id);

    // If no event exists with this ID, return 404 Not Found
    if (!event) {
      return res.status(404).json({
        message: 'Event not found'
      });
    }

    // Return 200 OK with the event details
    res.status(200).json(event);
  } catch (error) {
    console.error(`Error fetching event: ${error.message}`);

    // Handle invalid MongoDB ObjectId format (CastError)
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid event ID format'
      });
    }

    // Return 500 Internal Server Error for unexpected server errors
    res.status(500).json({
      message: 'Server error while fetching event'
    });
  }
});

// @route   POST /api/events
// @desc    Create a new event
// @access  Public
router.post('/', async (req, res) => {
  try {
    const {
      title,
      date,
      time,
      venue,
      description,
      totalCapacity,
      availableSeats
    } = req.body;

    // Create and save new event document in MongoDB
    const createdEvent = await Event.create({
      title,
      date,
      time,
      venue,
      description,
      totalCapacity,
      availableSeats
    });

    // Return HTTP 201 Created status with the newly created event object
    res.status(201).json(createdEvent);
  } catch (error) {
    console.error(`Error creating event: ${error.message}`);

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        error: error.message
      });
    }

    // Return 500 Internal Server Error for unexpected errors
    res.status(500).json({
      message: 'Server error while creating event'
    });
  }
});

// @route   PUT /api/events/:id
// @desc    Update an existing event by its MongoDB ObjectId
// @access  Public
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      date,
      time,
      venue,
      description,
      totalCapacity,
      availableSeats
    } = req.body;

    // Find event by ID and apply updates with validators enabled and returning updated document
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      {
        title,
        date,
        time,
        venue,
        description,
        totalCapacity,
        availableSeats
      },
      {
        new: true, // Return the modified document rather than the original
        runValidators: true // Enforce schema validations on updated fields
      }
    );

    // If no event exists with this ID, return 404 Not Found
    if (!updatedEvent) {
      return res.status(404).json({
        message: 'Event not found'
      });
    }

    // Return 200 OK with the updated event object
    res.status(200).json(updatedEvent);
  } catch (error) {
    console.error(`Error updating event: ${error.message}`);

    // Handle invalid MongoDB ObjectId format (CastError)
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid event ID format'
      });
    }

    // Handle Mongoose schema validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        error: error.message
      });
    }

    // Return 500 Internal Server Error for unexpected server errors
    res.status(500).json({
      message: 'Server error while updating event'
    });
  }
});

// @route   DELETE /api/events/:id
// @desc    Delete an event by its MongoDB ObjectId
// @access  Public
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the event document by its MongoDB _id
    const deletedEvent = await Event.findByIdAndDelete(id);

    // If no event exists with this ID, return 404 Not Found
    if (!deletedEvent) {
      return res.status(404).json({
        message: 'Event not found'
      });
    }

    // Return 200 OK with success message
    res.status(200).json({
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error(`Error deleting event: ${error.message}`);

    // Handle invalid MongoDB ObjectId format (CastError)
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid event ID format'
      });
    }

    // Return 500 Internal Server Error for unexpected server errors
    res.status(500).json({
      message: 'Server error while deleting event'
    });
  }
});

// @route   POST /api/events/:id/register
// @desc    Register authenticated user for an event and decrement available seats using an ACID transaction
// @access  Private (Protected by JWT)
router.post('/:id/register', protect, async (req, res) => {
  const { id } = req.params;

  // Validate MongoDB ObjectId format before starting session
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      message: 'Invalid event ID format'
    });
  }

  // Start a Mongoose session for multi-document ACID transaction
  const session = await mongoose.startSession();

  try {
    // Start transaction
    session.startTransaction();

    // Find the event within the transaction session
    const event = await Event.findById(id).session(session);

    // If event does not exist, abort transaction and return 404
    if (!event) {
      await session.abortTransaction();
      return res.status(404).json({
        message: 'Event not found'
      });
    }

    // Check if seats are available
    if (event.availableSeats <= 0) {
      await session.abortTransaction();
      return res.status(400).json({
        message: 'No seats available for this event'
      });
    }

    // Check if authenticated user has already registered for this event
    const existingRegistration = await Registration.findOne({
      userId: req.userId,
      eventId: id
    }).session(session);

    if (existingRegistration) {
      await session.abortTransaction();
      return res.status(400).json({
        message: 'Already registered for this event'
      });
    }

    // Create Registration document inside transaction session
    await Registration.create(
      [
        {
          userId: req.userId,
          eventId: id
        }
      ],
      { session }
    );

    // Atomically decrement available seats with conditional check inside transaction session
    const updatedEvent = await Event.findOneAndUpdate(
      {
        _id: id,
        availableSeats: { $gt: 0 }
      },
      {
        $inc: { availableSeats: -1 }
      },
      {
        new: true, // Return modified document rather than original
        runValidators: true, // Enforce schema validations
        session
      }
    );

    // If seat decrement returned null due to concurrent booking, abort transaction
    if (!updatedEvent) {
      await session.abortTransaction();
      return res.status(400).json({
        message: 'No seats available for this event'
      });
    }

    // Commit transaction only when both operations succeed
    await session.commitTransaction();

    // Return 200 OK with the updated event details (compatible with frontend)
    res.status(200).json(updatedEvent);
  } catch (error) {
    // Abort transaction on any error if still active
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    console.error(`Error registering for event: ${error.message}`);

    // Handle invalid MongoDB ObjectId format (CastError)
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid event ID format'
      });
    }

    // Handle MongoDB duplicate-key error code 11000 from compound unique index
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Already registered for this event'
      });
    }

    // Return 500 Internal Server Error for unexpected server errors
    res.status(500).json({
      message: 'Server error while registering for event'
    });
  } finally {
    // End session to release database connection back to pool
    session.endSession();
  }
});

module.exports = router;


