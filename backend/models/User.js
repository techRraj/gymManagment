import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Please provide a name'], trim: true },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false,
    },
    age: { type: Number, min: 16, max: 80 },
    gender: { type: String, enum: ['male', 'female', 'other'], default: 'male' },
    location: {
      city: { type: String, required: true },
      postcode: String,
      coordinates: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] }, // [longitude, latitude]
      },
    },
    gymName: { type: String, trim: true },
    goals: [{ type: String, enum: ['strength', 'hypertrophy', 'powerlifting', 'weightloss', 'endurance', 'general'] }],
    trainingVolume: {
      type: String,
      enum: ['2-3x/week', '3-4x/week', '5-6x/week', 'daily'],
      required: true,
    },
    availability: [{
      day: { type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] },
      time: { type: String, enum: ['morning', 'afternoon', 'evening', 'night'] }
    }],
    experience: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'elite'],
      required: true,
    },
    bio: { type: String, maxlength: 500 },
    avatar: { type: String, default: 'https://i.imgur.com/default-avatar.png' },
    images: [String],
    crewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Crew' },
    matchPreferences: {
      minAge: Number,
      maxAge: Number,
      maxDistance: { type: Number, default: 25 }, // km
      preferredGoals: [String],
    },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Index for geospatial queries
userSchema.index({ 'location.coordinates': '2dsphere' });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);