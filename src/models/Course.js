const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  videoUrl: { type: String },
  duration: { type: Number, default: 0 }, // duration in minutes
  createdAt: { type: Date, default: Date.now },
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  price: { type: Number, default: 0 },
  category: { type: String }, // e.g., Programming, Design, Marketing
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  modules: [moduleSchema], // array of modules
  totalModules: { type: Number, default: 0 },
  totalDuration: { type: Number, default: 0 }, // in minutes
  enrollmentDeadline: { type: Date }, // last date to enroll
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  published: { type: Boolean, default: false },
  purchasedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // students who purchased
});

module.exports = mongoose.model('Course', courseSchema);
