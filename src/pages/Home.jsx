import { Link } from 'react-router-dom'
import { profile, stats } from '../data/portfolioData'

export default function Home() {
  return (
    <section className="hero">
      <p className="eyebrow">Hello, I am</p>
      <h2>{profile.name}</h2>
      <h3>{profile.title}</h3>
      <p className="subtitle">{profile.subtitle}</p>
      <p className="description">{profile.bio}</p>
      <div className="cta-row">
        <Link className="btn primary" to="/projects">View Projects</Link>
        <Link className="btn ghost" to="/contact">Contact Me</Link>
      </div>
      <div className="stats-grid">
        {stats.map((stat) => (
          <article key={stat.label} className="card stat-card">
            <h4>{stat.value}</h4>
            <p>{stat.label}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
