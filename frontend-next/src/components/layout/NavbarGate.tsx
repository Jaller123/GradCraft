"use client";

import React from "react";
import Navbar from "./Navbar";
import { supabase } from "../../lib/supabaseClient";

const NavbarGate: React.FC = () => {
  const [ready, setReady] = React.useState(false);
  const [signedIn, setSignedIn] = React.useState(false);

  React.useEffect(() => {
    const sync = async () => {
      const { data } = await supabase.auth.getSession();
      setSignedIn(!!data.session?.user);
      setReady(true);
    };
    sync();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(!!session?.user);
      setReady(true);
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (!ready || !signedIn) return null;
  return <Navbar />;
};

export default NavbarGate;
