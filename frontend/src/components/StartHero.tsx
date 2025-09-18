import React from "react";
import { Link } from "react-router-dom";
import styles from "./styles/StartHero.module.css";
import videoSrc from "../assets/large.mp4"; 
import LoopWords from "./LoopText"

type Props = {
  onCreateCvClick?: () => void;   // optional if you want programmatic navigation
  onRecruitersClick?: () => void; // optional if you want programmatic navigation
};

const StartHero: React.FC<Props> = ({ onCreateCvClick, onRecruitersClick }) => {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
       <video
        className={styles.bg}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source src={videoSrc} type="video/mp4" />
      </video>

      {/* Tint overlay */}
      <div className={styles.tint} aria-hidden />
      <div className={styles.inner}>
          <h1 id="hero-title" className={styles.title}>
          <span className={styles.heroText}>
            Helping students and recruiters turn {" "}
            <LoopWords
              words={["resumes", "matches", "offers"]}
              duration={6}          // tweak speed
              lineHeight={72}       // match your hero font size
              className={styles.loopAccent}
            />
            ‎‎ into opportunities.
          </span>
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
