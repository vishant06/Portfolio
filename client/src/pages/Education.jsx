import { GraduationCap } from 'lucide-react';
import SectionHeader from '../components/SectionHeader.jsx';
import { education } from '../data/portfolio.js';

const Education = () => (
  <section>
    <SectionHeader eyebrow="Education" title="Academic foundation">
      Information Technology studies with a strong software development focus.
    </SectionHeader>
    <article className="timeline-card">
      <div className="icon"><GraduationCap size={26} /></div>
      <div>
        <h3>{education.degree}</h3>
        <p>{education.institute}</p>
        <span>{education.semester}</span>
        <p>{education.details}</p>
      </div>
    </article>
  </section>
);

export default Education;
