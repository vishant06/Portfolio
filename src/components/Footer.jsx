import { profile } from '../data/portfolioData'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <p>© {new Date().getFullYear()} {profile.name}. Built with React + Vite.</p>
        <p>{profile.availability}</p>
      </div>
    </footer>
  )
}
