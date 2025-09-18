// src/components/LoopWords.tsx
import React from "react";
import { motion } from "framer-motion";
import styles from "./styles/LoopWords.module.css";

type Props = {
  words: string[];        // e.g., ["explore", "match", "get hired"]
  duration?: number;      // total seconds for one full cycle
  lineHeight?: number;    // px height of one row (match CSS)
  pauseEach?: number;     // optional: seconds to pause per word (set 0 for no pause)
  className?: string;
};

const LoopWords: React.FC<Props> = ({
  words,
  duration = 6,
  lineHeight = 56,
  pauseEach = 0,
  className = ""
}) => {
  // duplicate first item at end for seamless reset
  const list = words.length > 0 ? [...words, words[0]] : [];

  // If you want a slight hold on each word, increase duration accordingly
  const totalDuration =
    pauseEach > 0 ? duration + pauseEach * (list.length - 1) : duration;

  return (
    <div
      className={`${styles.mask} ${className}`}
      style={{ height: `${lineHeight}px` }}
      aria-hidden={words.length === 0}
    >
      <motion.div
        className={styles.col}
        // translate by one row per item (excluding the duplicated last)
        animate={{ y: `-${(list.length - 1) * lineHeight}px` }}
        transition={{
          duration: totalDuration,
          ease: "linear",
          repeat: Infinity,
          repeatType: "loop"
        }}
      >
        {list.map((w, i) => (
          <div
            className={styles.row}
            style={{ height: `${lineHeight}px` }}
            key={`${w}-${i}`}
          >
            {w}
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default LoopWords;
