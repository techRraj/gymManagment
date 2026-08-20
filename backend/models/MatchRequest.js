import mongoose from 'mongoose';

const matchRequestSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'cancelled'],
      default: 'pending',
    },
    message: { type: String, maxlength: 300 },
    matchScore: { type: Number, min: 0, max: 100 },
  },
  { timestamps: true }
);

// Prevent duplicate requests
matchRequestSchema.index({ sender: 1, receiver: 1 }, { unique: true });

export default mongoose.model('MatchRequest', matchRequestSchema);