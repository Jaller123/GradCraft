"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export const useAuthSession = (setStatus: (value: string) => void, onSignedIn?: () => void) => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [toast, setToast] = useState<string>("");
  const confirmRedirectRef = useRef(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user.email ?? null);
      if (data.session && confirmRedirectRef.current) {
        setToast("Email verified. You're signed in.");
        window.history.replaceState(null, "", window.location.pathname);
        confirmRedirectRef.current = false;
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUserEmail(session?.user.email ?? null);
      setStatus(event === "SIGNED_OUT" ? "Signed out" : "");
      if (event === "SIGNED_IN" && confirmRedirectRef.current) {
        setToast("Email verified. You're signed in.");
        window.history.replaceState(null, "", window.location.pathname);
        confirmRedirectRef.current = false;
        onSignedIn?.();
      } else if (event === "SIGNED_IN") {
        onSignedIn?.();
      }
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, [setStatus]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const reason = params.get("reason");
    if (reason === "login_required") {
      setToast("You have to be logged in.");
    }
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const type = params.get("type") ?? hashParams.get("type");
    const tokenHash = params.get("token_hash") ?? hashParams.get("token_hash");
    const accessToken = params.get("access_token") ?? hashParams.get("access_token");
    const code = params.get("code") ?? hashParams.get("code");
    confirmRedirectRef.current = type === "signup" || !!tokenHash || !!accessToken || !!code;
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 4500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  return { userEmail, toast, setToast };
};
