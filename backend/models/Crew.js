import mongoose from 'mongoose';

const crewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 50 },
    description: { type: String, maxlength: 500 },
    members: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      joinedAt: { type: Date, default: Date.now },
      role: { type: String, enum: ['founder', 'member'], default: 'member' }
    }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    maxMembers: { type: Number, default: 4, min: 2, max: 6 },
    location: {
      city: String,
      gymName: String,
    },
    trainingSchedule: [{
      day: String,
      time: String,
      activity: String
    }],
    goals: [String],
    isPrivate: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Ensure max members constraint
crewSchema.pre('save', function (next) {
  if (this.members.length > this.maxMembers) {
    throw new Error('Crew has reached maximum member capacity');
  }
  next();
});

export default mongoose.model('Crew', crewSchema);