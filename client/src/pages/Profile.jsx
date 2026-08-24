import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Profile() {
  const { user } = useAuth();
  return <section className="profile-page"><div className="section-header"><span>Your account</span><h1>Profile</h1><p>Manage your learning workspace and saved browser playgrounds.</p></div><div className="panel profile-card-view"><div className="profile-avatar">{user?.name?.slice(0, 1).toUpperCase()}</div><div><h2>{user?.name}</h2><p>@{user?.username}</p><p>{user?.email}</p><span className="badge">{user?.role}</span></div></div><div className="actions"><Link className="btn primary" to="/playground">My Playground</Link><Link className="btn ghost" to="/notes">Explore Notes</Link></div></section>;
}
