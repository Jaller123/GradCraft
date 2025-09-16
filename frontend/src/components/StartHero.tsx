import React from "react";
import { Link } from "react-router-dom";
import styles from "./styles/StartHero.module.css";

type Props = {
  onCreateCvClick?: () => void;   // optional if you want programmatic navigation
  onRecruitersClick?: () => void; // optional if you want programmatic navigation
};

const StartHero: React.FC<Props> = ({ onCreateCvClick, onRecruitersClick }) => {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.inner}>
        <h1 id="hero-title" className={styles.title}>
          <span>Your assistant at the</span>
          <span className={styles.underline}>start of your Career</span>
        </h1>

        <div className={styles.ctaRow}>
          {/* If you aren’t using a router yet, these anchor links jump to sections */}
          <Link to="/cv" className={`${styles.cta} ${styles.primary}`}>
            Create your CV
            </Link>
            
           <Link to="/recruiters" className={`${styles.cta} ${styles.secondary}`}>
                For Recruiters
             </Link>
        </div>
      </div>

      {/* Subtle vignette glow */}
      <div className={styles.glow} aria-hidden />
    </section>
  );
};

export default StartHero;
