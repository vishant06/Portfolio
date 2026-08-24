import { motion } from "framer-motion";
import { Download, FolderKanban, Eye, BookOpen, Bot } from "lucide-react";
import { Link } from "react-router-dom";
import useTypingEffect from "../hooks/useTypingEffect.js";
import { absoluteAsset } from "../services/api.js";
import { profile } from "../data/portfolio.js";
// import { Download, Eye } from "lucide-react";

const Home = () => {
  const typed = useTypingEffect([
    "React Developer",
    "Node.js Developer",
    "MongoDB Builder",
  ]);

  const downloadResume = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/resume/latest`,
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      window.location.href = absoluteAsset(data.fileUrl);
    } catch (error) {
      alert(error.message || "Resume is not available yet.");
    }
  };

  return (
    <section className="hero">

      <motion.div
        className="profile-card"
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.55 }}
      >
        <img src="WhatsApp Image 2026-08-09 at 11.35.46 AM.jpeg" alt="Vishant Kumar profile" />
        <div>
          <strong>Available for MERN projects</strong>
          <span>React • Express • MongoDB</span>
        </div>
      </motion.div>
            <motion.div
        initial={{ opacity: 0, x: -22 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.55 }}
      >
        <span className="eyebrow">Vishant Kumar’s developer learning platform</span>
        <h1>Learn. Code. Build.</h1>
        <h2>
          {profile.title} <span className="typing">{typed}</span>
        </h2>
        <p>Quality programming notes, a browser playground, projects and AI-powered learning — all in one place.</p>
        <div className="actions">
          <Link className="btn primary" to="/notes">
            <BookOpen size={18} /> Explore Notes
          </Link>
          <Link className="btn secondary" to="/playground">
            <FolderKanban size={18} /> Open Playground
          </Link>
          <Link className="btn ghost" to="/assistant">
            <Bot size={18} /> Ask AI
          </Link>
        </div>
      </motion.div>
    </section>
  );
};

export default Home;
