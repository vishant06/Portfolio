import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, required: true, maxlength: 500 },
  category: { type: String, required: true, trim: true },
  tags: [{ type: String, trim: true }],
  thumbnail: { type: String, default: '' },
  content: { type: String, required: true },
  codeExamples: [{ language: String, code: String, title: String }],
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  published: { type: Boolean, default: false },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });
export default mongoose.model('Note', noteSchema);
