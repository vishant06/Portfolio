import { highlights, profile } from '../data/portfolioData'

export default function About() {
  return (
    <section>
      <h2>About Me</h2>
      <p className="description">{profile.bio}</p>
      <p><strong>Location:</strong> {profile.location}</p>
      <p><strong>Current Focus:</strong> Deepening full-stack architecture knowledge and contributing to production-grade applications.</p>
      <div className="card">
        <h3>What I bring</h3>
        <ul>
          {highlights.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}
