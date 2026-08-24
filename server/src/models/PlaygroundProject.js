import mongoose from 'mongoose';
const playgroundProjectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  language: { type: String, default: 'web', enum: ['web', 'javascript', 'typescript', 'python', 'c', 'cpp', 'java'] },
  code: { type: String, default: '', maxlength: 100_000 },
  html: { type: String, default: '', maxlength: 100_000 }, css: { type: String, default: '', maxlength: 100_000 }, javascript: { type: String, default: '', maxlength: 100_000 },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });
export default mongoose.model('PlaygroundProject', playgroundProjectSchema);
