import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import styles from "./styles/ScrollStory.module.css";

const blocks = [
  {
    title: "Tell your story",
    body:
      "Drop your background in plain language. We listen for roles, dates, schools, and projects so you don't have to wrestle with forms first.",
  },
  {
    title: "AI fills the form",
    body:
      "The chatbot lifts your details into structured fields instantly so you can tweak and export a job-ready CV faster than hand-filling forms.",
  },
];

const ScrollStory: React.FC = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { margin: "-20% 0px", once: false });

  return (
    <section className={styles.section} id="how-it-works" ref={ref}>
      <div className={styles.inner}>
        <div className={styles.lineWrap} aria-hidden>
          <motion.div
            className={styles.line}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={isInView ? { scaleY: 1, opacity: 1 } : {}}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>

        <div className={styles.grid}>
          {blocks.map((item, idx) => (
            <motion.div
              key={item.title}
              className={styles.card}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              transition={{ duration: 0.6, delay: 0.15 * idx, ease: "easeOut" }}
            >
              <p className={styles.kicker}>{item.title}</p>
              <p className={styles.body}>{item.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ScrollStory;
