"use client";

export default function GlobalError({ error }: { error: Error }) {
  return (
    <html>
      <body style={{ padding: 32 }}>
        <h1>App error</h1>
        <p>{error.message || "Unexpected error."}</p>
      </body>
    </html>
  );
}
