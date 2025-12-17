import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { clearCurrent } from "./CvStore";
import styles from "./styles/Navbar.module.css";
import { supabase } from "../lib/supabaseClient";

const Navbar: React.FC = () => {
  const nav = useNavigate();
  const [userEmail, setUserEmail] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user.email ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUserEmail(session?.user.email ?? null);
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUserEmail(null);
    setLoading(false);
    clearCurrent();
    nav("/login");
  };

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
        </ul>

        <div className={styles.userArea}>
          {userEmail ? (
            <>
              <span className={styles.userLabel}>Currently logged in as:</span>
              <span className={styles.userChip}>{userEmail}</span>
              <button className={styles.logout} onClick={handleLogout} disabled={loading}>
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className={styles.loginBtn}>Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
