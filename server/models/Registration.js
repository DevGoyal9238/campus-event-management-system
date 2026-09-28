const mongoose = require('mongoose');

// Define the Registration Schema (Blueprint)
const registrationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required']
    }
  },
  {
    timestamps: true // Automatically adds createdAt and updatedAt fields
  }
);

// Create a compound unique index on (userId + eventId)
// This guarantees at the database level that a user cannot register for the same event more than once
registrationSchema.index({ userId: 1, eventId: 1 }, { unique: true });

// Create and export the Registration Model
const Registration = mongoose.model('Registration', registrationSchema);

module.exports = Registration;
