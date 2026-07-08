import mongoose from 'mongoose';

const subtopicSchema = new mongoose.Schema(
  {
    module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
    title: { type: String, required: true },
    type: { type: String, enum: ['video', 'mini-quiz', 'mega-quiz'], required: true },
    videoUrl: { type: String }, // Optional, for videos
    quizRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }, // Optional, for quizzes
    position: { type: Number, required: true }, // Order within the module sequence
    ecoPointsReward: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Subtopic = mongoose.model('Subtopic', subtopicSchema);
export default Subtopic;
