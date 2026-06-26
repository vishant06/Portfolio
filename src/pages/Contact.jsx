import { profile } from '../data/portfolioData'

export default function Contact() {
  return (
    <section>
      <h2>Let’s Connect</h2>
      <p className="description">Interested in working together or discussing an idea? Reach out and I will respond quickly.</p>
      <div className="card">
        <p><strong>Email:</strong> <a href={`mailto:${profile.email}`}>{profile.email}</a></p>
        <p><strong>Status:</strong> {profile.availability}</p>
        <p><strong>Location:</strong> {profile.location}</p>
      </div>
    </section>
  )
}
