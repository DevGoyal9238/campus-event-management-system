const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

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
// @desc    Register for an event and decrement available seats atomically
// @access  Public
router.post('/:id/register', async (req, res) => {
  try {
    const { id } = req.params;

    // Atomically find event and decrement availableSeats if seats > 0
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
        runValidators: true // Enforce schema validations
      }
    );

    // If no document was updated, determine if event does not exist or is fully booked
    if (!updatedEvent) {
      const existingEvent = await Event.findById(id);

      // If no event exists with this ID, return 404 Not Found
      if (!existingEvent) {
        return res.status(404).json({
          message: 'Event not found'
        });
      }

      // If event exists but has 0 seats, return 400 Bad Request
      return res.status(400).json({
        message: 'No seats available for this event'
      });
    }

    // Return 200 OK with the updated event details
    res.status(200).json(updatedEvent);
  } catch (error) {
    console.error(`Error registering for event: ${error.message}`);

    // Handle invalid MongoDB ObjectId format (CastError)
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid event ID format'
      });
    }

    // Return 500 Internal Server Error for unexpected errors
    res.status(500).json({
      message: 'Server error while registering for event'
    });
  }
});

module.exports = router;


