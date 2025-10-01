import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { listCvs, setCurrent, createCv } from "./CvStore";
import type { CvData } from "./types";
import styles from "./styles/Navbar.module.css";

const EMPTY: CvData = {
  fullName: "", title: "", summary: "",
  contacts: { email:"", phone:"", location:"", links:[] },
  skills: [], experience: [], education: [], projects: [], languages: []
};

const Navbar: React.FC = () => {
  const nav = useNavigate();
  const cvs = listCvs();

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <span className={styles.brand} onClick={() => nav("/")}>
          GradCraft
        </span>

        <ul className={styles.links}>
          <li><a href="#chat" className={styles.link}>Chat</a></li>
          <li><Link to="/cv" className={styles.link}>CV Builder</Link></li>
          <li><Link to="/saved" className={styles.link}>Saved CVs</Link></li>
          <li><a href="#recruiters" className={styles.link}>Recruiters</a></li>
        </ul>

        <div className={styles.cvActions}>
          <select
            className={styles.cvSelect}
            defaultValue=""
            onChange={(e) => {
              const id = e.target.value;
              if (!id) return;
              setCurrent(id);
              nav("/cv");
            }}
          >
            <option value="">Switch CV…</option>
            {cvs.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>

          <button
            className={styles.newCvBtn}
            onClick={() => {
              const title = prompt("New CV title") || "Untitled CV";
              createCv(title, EMPTY);
              nav("/cv");
            }}
          >
            + New CV
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
