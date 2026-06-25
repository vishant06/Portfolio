import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { navLinks } from '../data/portfolioData'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="navbar-wrap">
      <nav className="container navbar">
        <h1 className="logo">VK<span>Dev</span></h1>
        <button className="menu-btn" onClick={() => setOpen(!open)} aria-label="Toggle navigation menu">
          ☰
        </button>
        <ul className={`nav-list ${open ? 'show' : ''}`}>
          {navLinks.map((link) => (
            <li key={link.path}>
              <NavLink
                to={link.path}
                onClick={() => setOpen(false)}
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
