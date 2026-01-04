"use client";

import React from "react";
import styles from "./OptionsPage.module.css";
import OptionsTabs from "./components/OptionsTabs";
import ProfileForm from "./components/ProfileForm";
import SecurityForm from "./components/SecurityForm";
import { useOptionsState } from "./useOptionsState";

const OptionsPage: React.FC = () => {
  const {
    tab,
    setTab,
    profile,
    setProfile,
    loading,
    saving,
    error,
    status,
    currentPassword,
    newPassword,
    confirmPassword,
    pendingEmail,
    resumes,
    deletePassword,
    deletingAccount,
    setCurrentPassword,
    setNewPassword,
    setConfirmPassword,
    setPendingEmail,
    setDeletePassword,
    updateProfile,
    handleEmailUpdate,
    handlePasswordChange,
    handleDeleteAccount,
  } = useOptionsState();

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.shell}>
          <p className={styles.hint}>Loading options...</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <h1 className={styles.title}>Options</h1>
          <p className={styles.subtitle}>Manage your profile, email, and security settings.</p>
        </header>

        <OptionsTabs tab={tab} onChange={setTab} />

        {tab === "profile" && (
          <ProfileForm
            profile={profile}
            resumes={resumes}
            saving={saving}
            status={status}
            error={error}
            onChange={setProfile}
            onSave={updateProfile}
          />
        )}

        {tab === "security" && (
          <SecurityForm
            pendingEmail={pendingEmail}
            currentPassword={currentPassword}
            newPassword={newPassword}
            confirmPassword={confirmPassword}
            deletePassword={deletePassword}
            saving={saving}
            deletingAccount={deletingAccount}
            status={status}
            error={error}
            onPendingEmailChange={setPendingEmail}
            onCurrentPasswordChange={setCurrentPassword}
            onNewPasswordChange={setNewPassword}
            onConfirmPasswordChange={setConfirmPassword}
            onDeletePasswordChange={setDeletePassword}
            onEmailUpdate={handleEmailUpdate}
            onPasswordChange={handlePasswordChange}
            onDeleteAccount={handleDeleteAccount}
          />
        )}
      </div>
    </main>
  );
};

export default OptionsPage;
