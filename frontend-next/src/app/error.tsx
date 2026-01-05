"use client";

import React from "react";

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main style={{ padding: 32 }}>
      <h1>Something went wrong</h1>
      <p>{error.message || "Unexpected error."}</p>
      <button onClick={reset} style={{ marginTop: 12 }}>
        Try again
      </button>
    </main>
  );
}
