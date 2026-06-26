import SectionHeader from "../components/SectionHeader.jsx";

const interests = [
  "Mern Stack Development",
  "Programming",
  "Badminton",
  "Learning New Technologies",
  "Data Structures & Algorithms",
];

const About = () => (
  <section>
    <SectionHeader
      eyebrow="About Me"
      title="Focused on building useful web products"
    >
      I am Vishant Kumar, a MERN Stack Developer who enjoys turning ideas into
      clean, responsive, and maintainable applications.
    </SectionHeader>
    <div className="grid two">
      <article className="panel">
        <h3>Introduction</h3>
        <p>
          I'm a passionate **Full Stack MERN Developer** and **B.Tech IT**
          student dedicated to building responsive, scalable, and
          production-ready web applications. My expertise includes **React.js,
          Vite, Node.js, Express.js, MongoDB Atlas, REST APIs, Git, and
          JavaScript**. I also actively practice **Data Structures & Algorithms
          in Java** to strengthen my problem-solving skills and write efficient,
          maintainable code. I'm continuously learning new technologies and
          enjoy turning innovative ideas into impactful digital experiences.
        </p>
      </article>
      <article className="panel">
        <h3>Career Objective</h3>
        <p>
          To build impactful, scalable, and innovative software solutions by
          combining strong programming fundamentals, modern web development
          technologies, and problem-solving skills. I aim to contribute to
          meaningful projects, collaborate with talented teams, and continuously
          grow as a Full Stack Software Engineer.
        </p>
      </article>
      <article className="panel">
        <h3>Education Summary</h3>
        <p>
          I am currently pursuing a **Bachelor of Technology (B.Tech)** in
          **Information Technology** at **Sir Chhotu Ram Institute of
          Engineering & Technology (SCRIET), Chaudhary Charan Singh University,
          Meerut**. Throughout my academic journey, I have developed a strong
          foundation in programming, software development, database management,
          and computer science fundamentals. Alongside my coursework, I actively
          build real-world MERN stack projects and strengthen my problem-solving
          skills through **Data Structures & Algorithms in Java**, continuously
          expanding my technical expertise.
        </p>
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
