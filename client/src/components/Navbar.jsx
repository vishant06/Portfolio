import { Menu, Moon, Sun, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';
import styles from './Navbar.module.css';

const links = ['Home', 'About', 'Skills', 'Projects', 'Education', 'Contact', 'Resume'];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <NavLink to="/" className={styles.logo} onClick={() => setOpen(false)}>
          &lt;VK/&gt;
        </NavLink>
        <button className={styles.menuButton} onClick={() => setOpen((value) => !value)} aria-label="Toggle menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
        <div className={`${styles.links} ${open ? styles.open : ''}`}>
          {links.map((link) => {
            const path = link === 'Home' ? '/' : `/${link.toLowerCase()}`;
            return (
              <NavLink key={link} to={path} onClick={() => setOpen(false)} className={({ isActive }) => (isActive ? styles.active : '')}>
                {link}
              </NavLink>
            );
          })}
          <button className={styles.themeButton} onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
