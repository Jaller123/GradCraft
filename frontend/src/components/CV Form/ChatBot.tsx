import React, { useEffect, useState } from "react";
import styles from "../styles/Chatbot.module.css";
import { extractCv } from "../api";

type Role = "user" | "assistant";
type Msg = { id: string; role: Role; content: string; ts: number };

const STORAGE_KEY = "cv_chat_messages_v1";
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

type Props = {
  onCvExtract: (cvJson: any) => void;
};

const Chatbot: React.FC<Props> = ({ onCvExtract }) => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // load/save history
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setMessages(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {}
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Msg = {
      id: uid(),
      role: "user",
      content: text,
      ts: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setError("");

    try {
      // Call backend to EXTRACT → CV JSON from the latest user message
      const cvJson = await extractCv(text);
      onCvExtract(cvJson);

      const aiMsg: Msg = {
        id: uid(),
        role: "assistant",
        content:
          "✅ I’ve filled the form with what you told me. Review and edit on the right.",
        ts: Date.now(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      setMessages((prev) => [
        ...prev,
        { id: uid(), role: "assistant", content: `⚠️ ${msg}`, ts: Date.now() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <header className={styles.head}>
        <h2 className={styles.title}>CV Chatbot</h2>
        <button
          className={styles.clearBtn}
          onClick={() => {
            setMessages([]);
            localStorage.removeItem(STORAGE_KEY);
          }}
        >
          Clear
        </button>
      </header>

      <div className={styles.history}>
        {messages.length === 0 && (
          <div className={styles.empty}>
            Tell me: your name, graduation, school, city, and projects. I’ll
            fill the form.
          </div>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`${styles.msg} ${
              m.role === "user" ? styles.me : styles.bot
            }`}
          >
            <div className={styles.msgText}>{m.content}</div>
            <div className={styles.meta}>
              {m.role === "user" ? "You" : "Assistant"} •{" "}
              {new Date(m.ts).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.inputRow}>
        <textarea
          className={styles.textarea}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={4}
          placeholder={`Example: 
"I'm {name}, newly graduated {Job in} (June 2025) from Jensen YH in Kista, Stockholm. 
Built an AMS mock API tool with React, Node.js, MySQL, Docker, Cypress. Languages: English & Swedish."`}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") send();
          }}
        />
        <button
          className={styles.sendBtn}
          onClick={send}
          disabled={!input.trim() || loading}
        >
          {loading ? "Working..." : "Send"}
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
};

export default Chatbot;
