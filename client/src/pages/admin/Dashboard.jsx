import { Check, LogOut, Pencil, Plus, RefreshCw, ShieldCheck, ShieldOff, Trash2, Upload, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import request, { absoluteAsset } from '../../services/api.js';
import '../../styles/admin.css';

const emptyProject = {
  title: '',
  description: '',
  technologies: '',
  githubLink: '',
  liveLink: '',
  featured: false,
  image: null
};

const Dashboard = () => {
  const { logout, user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [messages, setMessages] = useState([]);
  const [resume, setResume] = useState(null);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyProject);
  const [editingId, setEditingId] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const [editingUserId, setEditingUserId] = useState(null);
  const [userEditForm, setUserEditForm] = useState({ name: '', username: '', email: '' });
  const [userStatus, setUserStatus] = useState('');

  const stats = useMemo(
    () => [
      ['Projects', projects.length],
      ['Featured', projects.filter((project) => project.featured).length],
      ['Messages', messages.length],
      ['Users', users.length]
    ],
    [messages.length, projects, users.length]
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const [projectData, messageData, resumeData, userData] = await Promise.all([
        request('/projects'),
        request('/contact/messages'),
        request('/resume/latest').catch(() => null),
        request('/admin/users').catch(() => [])
      ]);
      setProjects(projectData);
      setMessages(messageData);
      setResume(resumeData);
      setUsers(userData);
    } catch (error) {
      setStatus(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateField = (event) => {
    const { name, value, checked, type, files } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value
    }));
  };

  const resetForm = () => {
    setForm(emptyProject);
    setEditingId(null);
  };

  const editProject = (project) => {
    setEditingId(project._id);
    setForm({
      title: project.title,
      description: project.description,
      technologies: project.technologies.join(', '),
      githubLink: project.githubLink || '',
      liveLink: project.liveLink || '',
      featured: project.featured,
      image: null
    });
  };

  const saveProject = async (event) => {
    event.preventDefault();
    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== null) payload.append(key, value);
    });

    try {
      if (editingId) {
        await request(`/projects/${editingId}`, { method: 'PUT', body: payload });
        setStatus('Project updated.');
      } else {
        await request('/projects', { method: 'POST', body: payload });
        setStatus('Project added.');
      }
      resetForm();
      loadData();
    } catch (error) {
      setStatus(error.message);
    }
  };

  const removeProject = async (id) => {
    if (!confirm('Delete this project?')) return;
    try {
      await request(`/projects/${id}`, { method: 'DELETE' });
      setStatus('Project deleted.');
      loadData();
    } catch (error) {
      setStatus(error.message);
    }
  };

  const uploadResume = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const payload = new FormData();
    payload.append('resume', file);
    try {
      const data = await request('/resume/upload', { method: 'POST', body: payload });
      setResume(data);
      setStatus('Resume uploaded.');
    } catch (error) {
      setStatus(error.message);
    }
  };

  const changeUserRole = async (targetUser, role) => {
    setUserStatus('');
    try {
      await request(`/admin/users/${targetUser._id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) });
      setUserStatus(`${targetUser.name} is now ${role === 'admin' ? 'an administrator' : 'a regular user'}.`);
      loadData();
    } catch (error) {
      setUserStatus(error.message);
    }
  };

  const startEditUser = (targetUser) => {
    setEditingUserId(targetUser._id);
    setUserEditForm({ name: targetUser.name, username: targetUser.username, email: targetUser.email });
  };

  const cancelEditUser = () => {
    setEditingUserId(null);
    setUserEditForm({ name: '', username: '', email: '' });
  };

  const saveEditUser = async (id) => {
    setUserStatus('');
    try {
      await request(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(userEditForm) });
      setUserStatus('User updated.');
      cancelEditUser();
      loadData();
    } catch (error) {
      setUserStatus(error.message);
    }
  };

  const removeUser = async (id) => {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    setUserStatus('');
    try {
      await request(`/admin/users/${id}`, { method: 'DELETE' });
      setUserStatus('User deleted.');
      loadData();
    } catch (error) {
      setUserStatus(error.message);
    }
  };

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <strong>VK Admin</strong>
        <span>{user?.email}</span>
        <button className="btn ghost" onClick={logout}><LogOut size={18} /> Logout</button>
      </aside>
      <section className="admin-content">
        <div className="admin-heading">
          <div>
            <span className="eyebrow">Dashboard</span>
            <h1>Portfolio control center</h1>
          </div>
          <button className="btn ghost" onClick={loadData}><RefreshCw size={18} /> Refresh</button>
        </div>

        <div className="admin-stats">
          {stats.map(([label, value]) => (
            <article className="panel" key={label}><span>{label}</span><strong>{value}</strong></article>
          ))}
        </div>

        {status && <p className="notice">{status}</p>}
        {loading && <p className="notice">Loading admin data...</p>}

        <div className="admin-grid">
          <form className="form panel" onSubmit={saveProject}>
            <h2>{editingId ? 'Edit Project' : 'Add Project'}</h2>
            <label>Title<input name="title" value={form.title} onChange={updateField} required /></label>
            <label>Description<textarea name="description" value={form.description} onChange={updateField} required /></label>
            <label>Technologies<input name="technologies" value={form.technologies} onChange={updateField} placeholder="React, Node.js, MongoDB" required /></label>
            <label>GitHub Link<input name="githubLink" value={form.githubLink} onChange={updateField} /></label>
            <label>Live Demo Link<input name="liveLink" value={form.liveLink} onChange={updateField} /></label>
            <label>Project Image<input name="image" type="file" accept="image/*" onChange={updateField} /></label>
            <label className="checkbox"><input name="featured" type="checkbox" checked={form.featured} onChange={updateField} /> Featured project</label>
            <div className="actions">
              <button className="btn primary"><Plus size={18} /> {editingId ? 'Save Changes' : 'Add Project'}</button>
              {editingId && <button type="button" className="btn ghost" onClick={resetForm}>Cancel</button>}
            </div>
          </form>

          <div className="panel">
            <h2>Resume Upload</h2>
            <label className="upload-box">
              <Upload size={22} />
              <span>Upload latest resume</span>
              <input type="file" accept=".pdf,.doc,.docx" onChange={uploadResume} />
            </label>
            {resume && <a className="inline-link" href={absoluteAsset(resume.fileUrl)} target="_blank" rel="noreferrer">View latest resume</a>}
          </div>
        </div>

        <section className="panel">
          <h2>Manage Projects</h2>
          <div className="admin-list">
            {projects.map((project) => (
              <article key={project._id}>
                <img src={absoluteAsset(project.image) || '/profile-placeholder.svg'} alt={project.title} />
                <div><strong>{project.title}</strong><span>{project.technologies.join(', ')}</span></div>
                <button className="btn ghost" onClick={() => editProject(project)}>Edit</button>
                <button className="icon-btn danger" onClick={() => removeProject(project._id)} aria-label="Delete project"><Trash2 size={18} /></button>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <h2>Contact Messages</h2>
          <div className="message-list">
            {messages.map((message) => (
              <article key={message._id}>
                <strong>{message.subject}</strong>
                <span>{message.name} • {message.email}</span>
                <p>{message.message}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <h2>Users</h2>
          {userStatus && <p className="notice">{userStatus}</p>}
          <div className="table-scroll">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Provider</th>
                  <th>Verified</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((target) => {
                  const isEditing = editingUserId === target._id;
                  const providerLabel = target.providers?.length
                    ? target.providers.map((entry) => entry.provider).join(', ')
                    : 'email';
                  return (
                    <tr key={target._id}>
                      <td>
                        <img
                          className="user-avatar-thumb"
                          src={absoluteAsset(target.avatar?.url) || '/profile-placeholder.svg'}
                          alt=""
                        />
                      </td>
                      <td>
                        {isEditing ? (
                          <input
                            value={userEditForm.name}
                            onChange={(event) => setUserEditForm({ ...userEditForm, name: event.target.value })}
                          />
                        ) : (
                          target.name
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <input
                            value={userEditForm.username}
                            onChange={(event) => setUserEditForm({ ...userEditForm, username: event.target.value })}
                          />
                        ) : (
                          `@${target.username}`
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <input
                            type="email"
                            value={userEditForm.email}
                            onChange={(event) => setUserEditForm({ ...userEditForm, email: event.target.value })}
                          />
                        ) : (
                          target.email
                        )}
                      </td>
                      <td><span className="badge">{target.role}</span></td>
                      <td>{providerLabel}</td>
                      <td>
                        <span className={`badge ${target.isEmailVerified ? 'verified' : 'pending'}`}>
                          {target.isEmailVerified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td>{new Date(target.createdAt).toLocaleDateString()}</td>
                      <td className="user-actions">
                        {isEditing ? (
                          <>
                            <button className="icon-btn" onClick={() => saveEditUser(target._id)} aria-label="Save user"><Check size={16} /></button>
                            <button className="icon-btn" onClick={cancelEditUser} aria-label="Cancel edit"><X size={16} /></button>
                          </>
                        ) : (
                          <>
                            <button className="icon-btn" onClick={() => startEditUser(target)} aria-label="Edit user"><Pencil size={16} /></button>
                            {target.role === 'admin' ? (
                              <button className="btn ghost small" onClick={() => changeUserRole(target, 'user')}><ShieldOff size={14} /> Make User</button>
                            ) : (
                              <button className="btn ghost small" onClick={() => changeUserRole(target, 'admin')}><ShieldCheck size={14} /> Make Admin</button>
                            )}
                            <button
                              className="icon-btn danger"
                              onClick={() => removeUser(target._id)}
                              aria-label="Delete user"
                              disabled={target._id === user?.id}
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
};

export default Dashboard;
