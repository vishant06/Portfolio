import Project from '../models/Project.js';

const toArray = (value) => {
  if (Array.isArray(value)) return value;
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

export const getProjects = async (_req, res) => {
  const projects = await Project.find().sort({ featured: -1, createdAt: -1 });
  res.json(projects);
};

export const getProject = async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found' });
  res.json(project);
};

export const createProject = async (req, res) => {
  const image = req.file ? `/uploads/projects/${req.file.filename}` : req.body.image || '';
  const project = await Project.create({
    title: req.body.title,
    description: req.body.description,
    technologies: toArray(req.body.technologies),
    image,
    githubLink: req.body.githubLink,
    liveLink: req.body.liveLink,
    featured: req.body.featured === 'true' || req.body.featured === true
  });
  res.status(201).json(project);
};

export const updateProject = async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found' });

  project.title = req.body.title ?? project.title;
  project.description = req.body.description ?? project.description;
  project.technologies = req.body.technologies ? toArray(req.body.technologies) : project.technologies;
  project.githubLink = req.body.githubLink ?? project.githubLink;
  project.liveLink = req.body.liveLink ?? project.liveLink;
  project.featured = req.body.featured === undefined ? project.featured : req.body.featured === 'true' || req.body.featured === true;
  if (req.file) project.image = `/uploads/projects/${req.file.filename}`;

  const updated = await project.save();
  res.json(updated);
};

export const deleteProject = async (req, res) => {
  const project = await Project.findByIdAndDelete(req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found' });
  res.json({ message: 'Project deleted' });
};
