"use client";

import { useEffect, useState } from "react";
import type { AccountType, Mode, RoleStep } from "./types";
import { useAuthSession } from "./useAuthSession";
import { useAuthActions } from "./useAuthActions";

export const useAuthPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [mode, setMode] = useState<Mode>("signin");
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleStep, setRoleStep] = useState<RoleStep>("select");
  const [studiedRole, setStudiedRole] = useState("");
  const [occupationRole, setOccupationRole] = useState("");
  const [industryCategory, setIndustryCategory] = useState("software");
  const [graduationYear, setGraduationYear] = useState("");
  const { userEmail, toast, setToast } = useAuthSession(setStatus);

  useEffect(() => {
    if (mode === "signin") {
      setAccountType(null);
      setShowRoleModal(false);
      setFullName("");
      setStudiedRole("");
      setOccupationRole("");
      setIndustryCategory("software");
      setGraduationYear("");
      setRoleStep("select");
    }
  }, [mode]);

  const { handleAuth, handleRoleSelect, handleRoleConfirm, handleSignOut, handleForgotPassword } = useAuthActions({
    email,
    password,
    fullName,
    mode,
    accountType,
    studiedRole,
    occupationRole,
    industryCategory,
    graduationYear,
    setError,
    setStatus,
    setToast,
    setLoading,
    setAccountType,
    setShowRoleModal,
    setRoleStep,
  });

  return {
    email,
    password,
    fullName,
    mode,
    status,
    error,
    toast,
    loading,
    userEmail,
    accountType,
    showRoleModal,
    roleStep,
    studiedRole,
    occupationRole,
    industryCategory,
    graduationYear,
    setEmail,
    setPassword,
    setFullName,
    setMode,
    setStudiedRole,
    setOccupationRole,
    setIndustryCategory,
    setGraduationYear,
    setShowRoleModal,
    handleAuth,
    handleRoleSelect,
    handleRoleConfirm,
    handleSignOut,
    handleForgotPassword,
    setRoleStep,
  };
};
