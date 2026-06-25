import { Github, Linkedin, Mail } from 'lucide-react';
import { profile } from '../data/portfolio.js';
import styles from './Footer.module.css';

const Footer = () => (
  <footer className={styles.footer}>
    <div>
      <strong>Vishant Kumar</strong>
      <span>© {new Date().getFullYear()} All rights reserved.</span>
    </div>
    <div className={styles.socials}>
      <a href={profile.github} target="_blank" aria-label="GitHub"><Github size={19} /></a>
      <a href={profile.linkedin} target="_blank"  aria-label="LinkedIn"><Linkedin size={19} /></a>
      <a href={`mailto:${profile.email}`} target="_blank"  aria-label="Email"><Mail size={19} /></a>
    </div>
  </footer>
);

export default Footer;
