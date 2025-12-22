"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearCurrent } from "./CvStore";
import styles from "./styles/Navbar.module.css";
import { supabase } from "../lib/supabaseClient";

const Navbar: React.FC = () => {
  const router = useRouter();
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
    router.push("/login");
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <span className={styles.brand} onClick={() => router.push("/")}>
          GradCraft
        </span>

        <ul className={styles.links}>
          <li><Link href="/cv" 
          className={styles.link}
          onClick={() => { clearCurrent(); }}
          >Resume Builder</Link></li>
          <li><Link href="/saved" className={styles.link}>Saved CVs</Link></li>
          <li><a href="/talenthub" className={styles.link}>Talent Hub</a></li>
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
            <Link href="/login" className={styles.loginBtn}>Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
