import mongoose from 'mongoose';

const questSubmissionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quest: { type: mongoose.Schema.Types.ObjectId, ref: 'Quest', required: true },
    files: [
      {
        url: { type: String, required: true },
        filename: { type: String, required: true },
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    remark: { type: String, enum: ['On Time', 'Late Submission'], default: 'On Time' },
    awardedPoints: { type: Number, default: 0 },
    submittedAt: { type: Date, default: Date.now },
    teacherComment: { type: String },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date },
  },
  { timestamps: true }
);

// Prevent duplicate quest submissions by a user
questSubmissionSchema.index({ user: 1, quest: 1 }, { unique: true });

const QuestSubmission = mongoose.model('QuestSubmission', questSubmissionSchema);
export default QuestSubmission;
