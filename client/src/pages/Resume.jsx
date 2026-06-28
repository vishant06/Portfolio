import { useEffect, useState } from "react";
import { ArrowLeft, Download, FileX } from "lucide-react";
import { Link } from "react-router-dom";
import { absoluteAsset } from "../services/api";

const Resume = () => {
  const [resume, setResume] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResume = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/resume/latest`
        );

        const data = await response.json();

        if (!response.ok) throw new Error(data.message);

        setResume(absoluteAsset(data.fileUrl));
      } catch (err) {
        setResume("");
      } finally {
        setLoading(false);
      }
    };

    loadResume();
  }, []);

  console.log("Resume URL:", resume);

  return (
    <section className="resume-page">

      <div className="resume-toolbar">
        <Link to="/" className="btn secondary">
          <ArrowLeft size={18} />
          Back
        </Link>

        {resume && (
          <a href={resume} download className="btn primary">
            <Download size={18} />
            Download Resume
          </a>
        )}
      </div>

      {loading ? (
        <p>Loading Resume...</p>
      ) : resume ? (
        <iframe
          src={resume}
          title="Resume"
          width="100%"
          height="900"
          style={{
            border: 0,
            borderRadius: "16px",
          }}
        />
      ) : (
        <div className="resume-empty">
          <FileX size={60} />
          <h2>No Resume Available</h2>
          <p>The resume hasn't been uploaded yet. Please check back later.</p>
        </div>
      )}
    </section>
  );
};

export default Resume;