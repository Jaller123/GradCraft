import React from "react";
import styles from "./styles/Navbar.module.css";

const Navbar: React.FC = () => (
  <nav className={styles.navbar}>
    <div className={styles.container}>
      <span className={styles.brand}>GradCraft</span>
      <ul className={styles.links}>
        <li><a href="#chat" className={styles.link}>Chat</a></li>
        <li><a href="#cv" className={styles.link}>CV</a></li>
        <li><a href="#recruiters" className={styles.link}>Recruiters</a></li>
      </ul>
    </div>
  </nav>
);

export default Navbar;
