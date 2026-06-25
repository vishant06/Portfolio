import { Outlet } from 'react-router-dom';
import Footer from './Footer.jsx';
import Navbar from './Navbar.jsx';
import styles from './Layout.module.css';

const Layout = () => (
  <div className={styles.shell}>
    <div className={styles.background} aria-hidden="true" />
    <Navbar />
    <main className={styles.main}>
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default Layout;
