import SectionHeader from '../components/SectionHeader.jsx';

const interests = ['Web Development', 'Programming', 'Badminton', 'Learning New Technologies'];

const About = () => (
  <section>
    <SectionHeader eyebrow="About Me" title="Focused on building useful web products">
      I am Vishant Kumar, a MERN Stack Developer who enjoys turning ideas into clean, responsive, and maintainable applications.
    </SectionHeader>
    <div className="grid two">
      <article className="panel">
        <h3>Introduction</h3>
        <p>
          I work across the full JavaScript stack with React.js on the frontend and Node.js, Express.js, and MongoDB on the backend. I care about clear interfaces, practical architecture, and smooth user experiences.
        </p>
      </article>
      <article className="panel">
        <h3>Career Objective</h3>
        <p>
          To grow as a software developer by building production-ready web applications, improving problem-solving skills, and contributing to teams that value clean code and continuous learning.
        </p>
      </article>
      <article className="panel">
        <h3>Education Summary</h3>
        <p>B.Tech Information Technology at SCRIET, CCS University, with a focus on programming, web development, databases, and software engineering fundamentals.</p>
      </article>
      <article className="panel">
        <h3>Interests</h3>
        <div className="chips">
          {interests.map((interest) => (
            <span key={interest}>{interest}</span>
          ))}
        </div>
      </article>
    </div>
  </section>
);

export default About;
