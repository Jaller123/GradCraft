import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { clearCurrent } from "./CvStore";
import styles from "./styles/Navbar.module.css";

const Navbar: React.FC = () => {
  const nav = useNavigate();

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <span className={styles.brand} onClick={() => nav("/")}>
          GradCraft
        </span>

        <ul className={styles.links}>
          <li><a href="#chat" className={styles.link}>Chat</a></li>
          <li><Link to="/cv" 
          className={styles.link}
          onClick={() => { clearCurrent(); }}
          >CV Builder</Link></li>
          <li><Link to="/saved" className={styles.link}>Saved CVs</Link></li>
          <li><a href="#recruiters" className={styles.link}>Recruiters</a></li>
          <li><Link to="/login" className={styles.link}>Login</Link></li>
        </ul>

        <div className={styles.cvActions}>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
