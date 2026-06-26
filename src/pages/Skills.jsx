import { skills } from '../data/portfolioData'

function SkillSection({ title, items }) {
  return (
    <article className="card">
      <h3>{title}</h3>
      <div className="tag-row">
        {items.map((item) => (
          <span key={item} className="tag">{item}</span>
        ))}
      </div>
    </article>
  )
}

export default function Skills() {
  return (
    <section>
      <h2>Technical Skills</h2>
      <p className="description">Technologies and tools I use regularly to build modern web applications.</p>
      <div className="grid">
        <SkillSection title="Frontend" items={skills.frontend} />
        <SkillSection title="Backend" items={skills.backend} />
        <SkillSection title="Tools & Deployment" items={skills.tools} />
      </div>
    </section>
  )
}
