import User from '../models/User.js';
import Note from '../models/Note.js';
import Project from '../models/Project.js';
import PlaygroundProject from '../models/PlaygroundProject.js';
export const users = async (_req, res) => res.json(await User.find().select('-password').sort({
    createdAt: -1
}));
export const stats = async (_req, res) => {
    const [users, notes, projects, playgrounds] = await Promise.all([User.countDocuments(), Note.countDocuments(), Project.countDocuments(), PlaygroundProject.countDocuments()]);
    res.json({
        users,
        notes,
        projects,
        playgrounds
    });
};