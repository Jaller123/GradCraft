import React from "react";
import { useNavigate } from "react-router-dom";
import { listCvs, setCurrent, renameCv, deleteCv } from "./CvStore";
import styles from "../components/styles/SaveCVsPage.module.css";

const SavedCvsPage: React.FC = () => {
  const nav = useNavigate();
  const [tick, setTick] = React.useState(0);
  const cvs = React.useMemo(() => listCvs(), [tick]);

  return (
    <div className={styles.wrap}>
      <h2 className={styles.title}>Saved CVs</h2>
      {cvs.length === 0 ? (
        <p>No saved CVs yet.</p>
      ) : (
        <ul className={styles.list}>
          {cvs.map(rec => (
            <li key={rec.id} className={styles.item}>
              <div>
                <strong>{rec.title}</strong>
                <div className={styles.meta}>
                  Updated: {new Date(rec.updatedAt).toLocaleString()}
                </div>
              </div>
              <div className={styles.actions}>
                <button onClick={() => { setCurrent(rec.id); nav("/cv"); }}>Open</button>
                <button onClick={() => {
                  const next = prompt("Rename CV", rec.title);
                  if (next != null) { renameCv(rec.id, next); setTick(t => t + 1); }
                }}>Rename</button>
                <button onClick={() => {
                  if (confirm("Delete this CV?")) { deleteCv(rec.id); setTick(t => t + 1); }
                }}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SavedCvsPage;
