import React from "react";
import { Link } from "react-router-dom";
import styles from "./styles/Footer.module.css";

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brandCol}>
          <div className={styles.logoRow}>
            <div className={styles.logoDot} />
            <div className={styles.brand}>
              <span className={styles.brandMain}>Grad</span>
              <span className={styles.brandAccent}>Craft</span>
            </div>
          </div>
          <p className={styles.tagline}>
            AI-powered CV builder and job search companion. Craft, iterate, and track your applications with ease.
          </p>
        </div>

        <div className={styles.linksCol}>
          <h4 className={styles.heading}>Services</h4>
          <Link to="/cv" className={styles.link}>CV Builder</Link>
          <Link to="/preview" className={styles.link}>CV Preview</Link>
          <Link to="/saved" className={styles.link}>Saved CVs</Link>
        </div>

        <div className={styles.linksCol}>
          <h4 className={styles.heading}>Information</h4>
          <a href="#privacy" className={styles.link}>Privacy Policy</a>
          <a href="mailto:hello@gradcraft.app" className={styles.link}>Contact us</a>
          <span className={styles.link}>Stockholm, Sweden</span>
        </div>
      </div>

      <div className={styles.meta}>
        <span>© {new Date().getFullYear()} GradCraft. All rights reserved.</span>
        <div className={styles.metaLinks}>
          <span>GDPR-compliant</span>
          <span>Supabase Auth secured</span>
          <span>AI-powered</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
