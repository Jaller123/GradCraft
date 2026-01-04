"use client";

import React from "react";
import styles from "./LoginPage.module.css";
import AuthForm from "./components/AuthForm";
import RoleModal from "./components/RoleModal";
import AuthFooter from "./components/AuthFooter";
import { useAuthPage } from "./useAuthPage";

const LoginPage: React.FC = () => {
  const {
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
  } = useAuthPage();

  return (
    <main className={styles.wrap}>
      {toast && <div className={styles.toast}>{toast}</div>}
      <div className={styles.card}>
        <h1 className={styles.title}>Sign {mode === "signin" ? "in" : "up"} to GradCraft</h1>
        <p className={styles.subtitle}>
          Use your email and password. We’ll keep your CVs tied to your account.
        </p>
        <AuthForm
          mode={mode}
          email={email}
          password={password}
          fullName={fullName}
          loading={loading}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onFullNameChange={setFullName}
          onSubmit={handleAuth}
          onForgotPassword={handleForgotPassword}
        />

        <RoleModal
          open={showRoleModal}
          roleStep={roleStep}
          accountType={accountType}
          loading={loading}
          industryCategory={industryCategory}
          studiedRole={studiedRole}
          occupationRole={occupationRole}
          graduationYear={graduationYear}
          onClose={() => setShowRoleModal(false)}
          onSelectRole={handleRoleSelect}
          onBack={() => setRoleStep("select")}
          onConfirm={handleRoleConfirm}
          onIndustryChange={setIndustryCategory}
          onStudiedRoleChange={setStudiedRole}
          onOccupationRoleChange={setOccupationRole}
          onGraduationYearChange={setGraduationYear}
        />

        <AuthFooter
          mode={mode}
          userEmail={userEmail}
          loading={loading}
          status={status}
          error={error}
          onToggleMode={() => setMode(mode === "signin" ? "signup" : "signin")}
          onSignOut={handleSignOut}
        />
      </div>
    </main>
  );
};

export default LoginPage;

