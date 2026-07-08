import mongoose from 'mongoose';

const moduleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    position: { type: Number, required: true }, // Order in sequence
    category: { type: String, enum: ['soil', 'water', 'carbon', 'other'], default: 'other' },
    ecoPointsReward: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Module = mongoose.model('Module', moduleSchema);
export default Module;
