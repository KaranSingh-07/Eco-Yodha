import mongoose from 'mongoose';

const quizSubmissionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
    subtopic: { type: mongoose.Schema.Types.ObjectId, ref: 'Subtopic' },
    answers: [{ type: Number }], // Selected option indices
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    timeTaken: { type: Number }, // Time taken in seconds
    isFirstAttempt: { type: Boolean, default: false },
    ecoPointsEarned: { type: Number, required: true },
  },
  { timestamps: true }
);

const QuizSubmission = mongoose.model('QuizSubmission', quizSubmissionSchema);
export default QuizSubmission;
