import { projects } from '../data/portfolioData'

export default function Projects() {
  return (
    <section>
      <h2>Projects</h2>
      <p className="description">A few project ideas that demonstrate my full-stack capabilities.</p>
      <div className="grid">
        {projects.map((project) => (
          <article key={project.name} className="card">
            <h3>{project.name}</h3>
            <p className="badge">{project.type}</p>
            <p>{project.description}</p>
            <div className="tag-row">
              {project.tech.map((item) => (
                <span key={item} className="tag">{item}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
