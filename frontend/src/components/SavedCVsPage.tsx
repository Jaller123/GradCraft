import React from "react";
import { useNavigate } from "react-router-dom";
import { listCvs, setCurrent, renameCv, deleteCv } from "./CvStore";
import styles from "../components/styles/SaveCVsPage.module.css";

const SavedCvsPage: React.FC = () => {
  const nav = useNavigate();
  const [tick, setTick] = React.useState(0);
  const cvs = React.useMemo(() => listCvs(), [tick]);
  const items = React.useMemo(() => listCvs(), [tick]);

  return (
<div className={styles.wrap}>
      <div className={styles.header}>
        <h2 className={styles.title}>Saved CVs</h2>
        {/* Optional: New CV lives here instead of navbar */}
        {/* <button className={styles.newBtn} onClick={...}>+ New CV</button> */}
      </div>

      {items.length === 0 ? (
        <p className={styles.empty}>No saved CVs yet.</p>
      ) : (
        <div className={styles.grid}>
          {items.map(rec => (
            <div key={rec.id} className={styles.card}>
              <div className={styles.thumbWrap} onClick={() => { setCurrent(rec.id); nav("/cv"); }}>
                {rec.thumbDataUrl
                  ? <img className={styles.thumb} src={rec.thumbDataUrl} alt={`${rec.title} preview`} />
                  : <div className={styles.thumbPlaceholder}>No preview</div>}
              </div>

              <div className={styles.meta}>
                <div className={styles.cardTitle} title={rec.title}>{rec.title}</div>
                <div className={styles.time}>Edited {new Date(rec.updatedAt).toLocaleDateString()}</div>
              </div>

              <div className={styles.actions}>
                <button onClick={() => { setCurrent(rec.id); nav("/cv"); }}>Open</button>
                <button onClick={() => {
                  const next = prompt("Rename CV", rec.title);
                  if (next != null) { renameCv(rec.id, next); setTick(t => t + 1); }
                }}>Rename</button>
                <button onClick={() => { if (confirm("Delete this CV?")) { deleteCv(rec.id); setTick(t => t + 1); } }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedCvsPage;
