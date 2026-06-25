import Resume from '../models/Resume.js';

export const getLatestResume = async (_req, res) => {
  const resume = await Resume.findOne().sort({ uploadedAt: -1 });
  if (!resume) return res.status(404).json({ message: 'Resume has not been uploaded yet' });
  res.json(resume);
};

export const uploadLatestResume = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Resume file is required' });

  const resume = await Resume.create({
    fileUrl: `/uploads/resumes/${req.file.filename}`,
    uploadedAt: new Date()
  });

  res.status(201).json(resume);
};
