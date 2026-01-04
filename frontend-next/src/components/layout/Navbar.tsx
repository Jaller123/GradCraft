"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearCurrent } from "../../features/cv/cvStore";
import styles from "./Navbar.module.css";
import { supabase } from "../../lib/supabaseClient";

type Profile = {
  full_name: string | null;
  role: string | null;
  studied_role: string | null;
  occupation_role: string | null;
  industry_category: string | null;
};

const Navbar: React.FC = () => {
  const router = useRouter();
  const [userEmail, setUserEmail] = React.useState<string | null>(null);
  const [userId, setUserId] = React.useState<string | null>(null);
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const syncSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUserEmail(data.session?.user.email ?? null);
      setUserId(data.session?.user.id ?? null);
      if (data.session?.user) {
        const { data: userData, error: userErr } = await supabase.auth.getUser();
        if (userErr || !userData.user) {
          await supabase.auth.signOut();
          setUserEmail(null);
          setUserId(null);
          setProfile(null);
          setMenuOpen(false);
        }
      }
    };
    syncSession();
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUserEmail(session?.user.email ?? null);
      setUserId(session?.user.id ?? null);
      if (!session?.user) {
        setProfile(null);
      }
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  React.useEffect(() => {
    if (!userId) return;
    supabase
      .from("profiles")
      .select("full_name,role,studied_role,occupation_role,industry_category")
      .eq("user_id", userId)
      .single()
      .then(({ data }) => {
        if (data) setProfile(data);
      });
  }, [userId]);

  React.useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUserEmail(null);
    setUserId(null);
    setProfile(null);
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
            <div className={styles.menu} ref={menuRef}>
              <button
                className={styles.menuTrigger}
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-expanded={menuOpen}
              >
                <span>{profile?.full_name || userEmail}</span>
                <span className={menuOpen ? styles.chevronUp : styles.chevronDown} aria-hidden>
                  ▾
                </span>
              </button>
              {menuOpen && (
                <div className={styles.menuPanel}>
                  <div className={styles.profileSummary}>
                    <div className={styles.profileName}>{profile?.full_name || "Profile"}</div>
                    <div className={styles.profileMeta}>{userEmail}</div>
                    {profile?.role && <div className={styles.profileMeta}>Role: {profile.role}</div>}
                    {profile?.studied_role && (
                      <div className={styles.profileMeta}>Studied: {profile.studied_role}</div>
                    )}
                    {profile?.occupation_role && (
                      <div className={styles.profileMeta}>Occupation: {profile.occupation_role}</div>
                    )}
                    {profile?.industry_category && (
                      <div className={styles.profileMeta}>Industry: {profile.industry_category}</div>
                    )}
                  </div>
                  <div className={styles.menuLinks}>
                    <Link className={styles.menuLink} href="/profile">
                      Profile
                    </Link>
                    <Link className={styles.menuLink} href="/options">
                      Options
                    </Link>
                    <button className={styles.menuLogout} onClick={handleLogout} disabled={loading}>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className={styles.loginBtn}>Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
