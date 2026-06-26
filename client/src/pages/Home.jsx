import { motion } from "framer-motion";
import { Download, FolderKanban, Eye } from "lucide-react";
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
        initial={{ opacity: 0, x: -22 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.55 }}
      >
        <span className="eyebrow">Hello, I am</span>
        <h1>{profile.name}</h1>
        <h2>
          {profile.title} <span className="typing">{typed}</span>
        </h2>
        <p>{profile.intro}</p>
        <div className="actions">
          <Link className="btn primary" to="/projects">
            <FolderKanban size={18} /> View Projects
          </Link>
          <Link className="btn secondary" to="/resume">
            <Eye size={18} />
            View Resume
          </Link>
          <button className="btn ghost" onClick={downloadResume}>
            <Download size={18} /> Download Resume
          </button>
        </div>
      </motion.div>
      <motion.div
        className="profile-card"
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.55 }}
      >
        <img src="\SAVE_20260619_172554.jpg" alt="Vishant Kumar profile" />
        <div>
          <strong>Available for MERN projects</strong>
          <span>React • Express • MongoDB</span>
        </div>
      </motion.div>
    </section>
  );
};

export default Home;
